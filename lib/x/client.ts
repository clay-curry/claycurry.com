/**
 * HTTP client for the X API v2 — bookmarks, bookmark folders, and user lookup.
 *
 * All public methods return `Effect` programs that yield typed domain objects
 * and fail with tagged errors from `./errors.ts`. This allows callers to
 * compose requests with `Effect.gen` and handle failures exhaustively via
 * `Effect.catchTag`.
 *
 * The module also exports two identity-verification helpers:
 * - {@link XBookmarksOwnerResolver} — resolves the configured owner username
 *   to an X user and validates any configured user ID.
 * - {@link XIdentityVerifier} — verifies the authenticated user matches the
 *   configured owner.
 *
 * @see https://developer.x.com/en/docs/twitter-api/tweets/bookmarks/api-reference
 * @see https://developer.x.com/en/docs/twitter-api/users/lookup/api-reference
 * @see https://effect.website/docs/getting-started/using-generators
 * @module
 */
import { Effect, Schema } from "effect";
import {
  type BookmarkSourceOwner,
  type NormalizedBookmark,
  NormalizedBookmarkSchema,
  type XBookmarkFolder,
  XBookmarkFoldersResponseSchema,
  XBookmarksResponseSchema,
  type XMedia,
  type XUser,
  XUserEnvelopeSchema,
} from "./contracts";
import {
  OwnerMismatch,
  ReauthRequired,
  SchemaInvalid,
  UpstreamError,
} from "./errors";

const BOOKMARKS_FIELDS = [
  "tweet.fields=created_at,public_metrics,author_id,attachments",
  "expansions=author_id,attachments.media_keys",
  "user.fields=name,username,profile_image_url,verified",
  "media.fields=url,preview_image_url,type,width,height",
  "max_results=100",
].join("&");

function normalizeOwner(user: XUser): BookmarkSourceOwner {
  return {
    id: user.id,
    username: user.username,
    name: user.name ?? null,
  };
}

/**
 * Decodes an unknown payload against an Effect Schema, wrapping decode
 * failures as `SchemaInvalid` errors with the given context label.
 */
function parseContract<A, I>(
  schema: Schema.Schema<A, I>,
  payload: unknown,
  context: string,
) {
  return Effect.try({
    try: () => Schema.decodeUnknownSync(schema)(payload),
    catch: (error) =>
      new SchemaInvalid({
        message: `${context} did not match the expected contract`,
        cause: error,
        tokenStatus: "invalid",
      }),
  });
}

/**
 * Reads and validates an HTTP response as JSON. Maps 401/403 to
 * `ReauthRequired`, other non-OK statuses to `UpstreamError`, and
 * non-JSON bodies to `SchemaInvalid`.
 */
function readJsonResponse(response: Response, context: string) {
  return Effect.gen(function* () {
    if (!response.ok) {
      const body = yield* Effect.promise(() => response.text());
      const message = `${context} failed (${response.status}): ${body}`;
      if (response.status === 401 || response.status === 403) {
        return yield* Effect.fail(
          new ReauthRequired({ message, tokenStatus: "invalid" }),
        );
      }
      return yield* Effect.fail(new UpstreamError({ message }));
    }

    return yield* Effect.tryPromise({
      try: () => response.json(),
      catch: (error) =>
        new SchemaInvalid({
          message: `${context} returned non-JSON`,
          cause: error,
          tokenStatus: "invalid",
        }),
    });
  });
}

/**
 * Transforms a raw `XBookmarksResponseSchema` payload into an array of
 * `NormalizedBookmark` objects by joining tweets with their `includes`
 * expansions (users and media) and re-shaping to the internal camelCase
 * format.
 */
function normalizeTweets(response: unknown) {
  return Effect.gen(function* () {
    const parsed = yield* parseContract(
      XBookmarksResponseSchema,
      response,
      "bookmarks response",
    );
    if (!parsed.data) {
      return [] as NormalizedBookmark[];
    }

    const usersMap = new Map<string, XUser>();
    for (const user of parsed.includes?.users ?? []) {
      usersMap.set(user.id, user);
    }

    const mediaMap = new Map<string, XMedia>();
    for (const media of parsed.includes?.media ?? []) {
      mediaMap.set(media.media_key, media);
    }

    return yield* Effect.forEach(parsed.data, (tweet) =>
      parseContract(
        NormalizedBookmarkSchema,
        {
          id: tweet.id,
          text: tweet.text,
          createdAt: tweet.created_at,
          author: {
            id: usersMap.get(tweet.author_id)?.id ?? tweet.author_id,
            name: usersMap.get(tweet.author_id)?.name ?? "Unknown",
            username: usersMap.get(tweet.author_id)?.username ?? "unknown",
            profileImageUrl: usersMap.get(tweet.author_id)?.profile_image_url,
            verified: usersMap.get(tweet.author_id)?.verified,
          },
          metrics: {
            likes: tweet.public_metrics?.like_count ?? 0,
            retweets: tweet.public_metrics?.retweet_count ?? 0,
            replies: tweet.public_metrics?.reply_count ?? 0,
            impressions: tweet.public_metrics?.impression_count ?? 0,
          },
          media: (tweet.attachments?.media_keys ?? [])
            .map((key) => mediaMap.get(key))
            .filter((media): media is XMedia => Boolean(media))
            .map((media) => ({
              type: media.type,
              url: media.url || media.preview_image_url || "",
              width: media.width,
              height: media.height,
            })),
        },
        "normalized bookmark",
      ),
    );
  });
}

/**
 * Issues an authenticated GET request to the given URL, parses the JSON
 * response, and returns the raw payload. Wraps fetch errors as
 * `UpstreamError` and delegates response validation to `readJsonResponse`.
 */
function requestJson(
  fetchImpl: typeof fetch,
  url: string,
  accessToken: string,
  context: string,
) {
  return Effect.gen(function* () {
    const response = yield* Effect.tryPromise({
      try: () =>
        fetchImpl(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      catch: (error) =>
        new UpstreamError({
          message: `${context} fetch failed`,
          cause: error,
        }),
    });
    return yield* readJsonResponse(response, context);
  });
}

/**
 * HTTP client for X API v2 bookmark and user endpoints.
 *
 * Each method returns an `Effect` that yields typed domain objects and fails
 * with tagged errors (`ReauthRequired`, `UpstreamError`, `SchemaInvalid`).
 * Pagination for bookmarks is handled automatically — `fetchAllBookmarks`
 * and `fetchBookmarksByFolder` follow `next_token` until all pages are
 * consumed.
 *
 * Accepts an optional custom `fetch` implementation for testing.
 *
 * @see https://developer.x.com/en/docs/twitter-api/tweets/bookmarks/api-reference
 */
export class XBookmarksClient {
  constructor(private readonly fetchImpl: typeof fetch = fetch) {}

  /**
   * Fetches the currently authenticated user via `GET /2/users/me`.
   * @param accessToken - Bearer token from the OAuth flow.
   * @returns Effect yielding a `BookmarkSourceOwner`.
   * @see https://developer.x.com/en/docs/twitter-api/users/lookup/api-reference/get-users-me
   */
  getAuthenticatedUser(accessToken: string) {
    const fetchImpl = this.fetchImpl;
    return Effect.gen(function* () {
      const payload = yield* requestJson(
        fetchImpl,
        "https://api.x.com/2/users/me",
        accessToken,
        "authenticated user lookup",
      );
      const parsed = yield* parseContract(
        XUserEnvelopeSchema,
        payload,
        "authenticated user response",
      );
      return normalizeOwner(parsed.data);
    });
  }

  /**
   * Looks up a user by username via `GET /2/users/by/username/:username`.
   * Used to resolve the configured `X_OWNER_USERNAME` to an X user ID.
   * @see https://developer.x.com/en/docs/twitter-api/users/lookup/api-reference/get-users-by-username-username
   */
  getUserByUsername(username: string, accessToken: string) {
    const fetchImpl = this.fetchImpl;
    return Effect.gen(function* () {
      const payload = yield* requestJson(
        fetchImpl,
        `https://api.x.com/2/users/by/username/${encodeURIComponent(username)}`,
        accessToken,
        "owner lookup",
      );
      const parsed = yield* parseContract(
        XUserEnvelopeSchema,
        payload,
        "owner lookup response",
      );
      return normalizeOwner(parsed.data);
    });
  }

  /**
   * Fetches all bookmarks for the user, auto-paginating through every page.
   * @see https://developer.x.com/en/docs/twitter-api/tweets/bookmarks/api-reference/get-users-id-bookmarks
   */
  fetchAllBookmarks(userId: string, accessToken: string) {
    return this.fetchBookmarksPages(
      userId,
      accessToken,
      (paginationToken) =>
        `https://api.x.com/2/users/${userId}/bookmarks?${BOOKMARKS_FIELDS}${paginationToken ? `&pagination_token=${paginationToken}` : ""}`,
      "bookmark fetch",
    );
  }

  /**
   * Fetches bookmarks within a specific folder, auto-paginating.
   * @param folderId - The bookmark folder ID to filter by.
   */
  fetchBookmarksByFolder(
    userId: string,
    folderId: string,
    accessToken: string,
  ) {
    return this.fetchBookmarksPages(
      userId,
      accessToken,
      (paginationToken) =>
        `https://api.x.com/2/users/${userId}/bookmarks/folders/${folderId}/tweets?${BOOKMARKS_FIELDS}${paginationToken ? `&pagination_token=${paginationToken}` : ""}`,
      "folder bookmark fetch",
    );
  }

  /**
   * Fetches all bookmark folders for the user. Returns an empty array
   * if the endpoint returns 403 or 404 (folders feature may not be
   * available for all accounts).
   */
  fetchBookmarkFolders(userId: string, accessToken: string) {
    const fetchImpl = this.fetchImpl;
    return Effect.gen(function* () {
      const response = yield* Effect.tryPromise({
        try: () =>
          fetchImpl(`https://api.x.com/2/users/${userId}/bookmarks/folders`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
        catch: (error) =>
          new UpstreamError({
            message: "bookmark folders fetch failed",
            cause: error,
          }),
      });

      if (response.status === 403 || response.status === 404) {
        return [] as XBookmarkFolder[];
      }

      const payload = yield* readJsonResponse(response, "bookmark folders");
      const parsed = yield* parseContract(
        XBookmarkFoldersResponseSchema,
        payload,
        "bookmark folders response",
      );
      return parsed.data ?? ([] as XBookmarkFolder[]);
    });
  }

  /**
   * Internal paginator: follows `meta.next_token` until all pages are
   * exhausted, normalizing each page's tweets and accumulating results.
   */
  private fetchBookmarksPages(
    _userId: string,
    accessToken: string,
    buildUrl: (paginationToken?: string) => string,
    context: string,
  ) {
    const fetchImpl = this.fetchImpl;
    return Effect.gen(function* () {
      const allBookmarks: NormalizedBookmark[] = [];
      let paginationToken: string | undefined;

      do {
        const payload = yield* requestJson(
          fetchImpl,
          buildUrl(paginationToken),
          accessToken,
          context,
        );
        const parsed = yield* parseContract(
          XBookmarksResponseSchema,
          payload,
          `${context} response`,
        );
        const tweets = yield* normalizeTweets(parsed);
        allBookmarks.push(...tweets);
        paginationToken = parsed.meta?.next_token;
      } while (paginationToken);

      return allBookmarks;
    });
  }
}

/**
 * Resolves the configured owner username to an X user and validates that
 * the resolved user ID matches the optional `X_OWNER_USER_ID` env var
 * (if set). Fails with `OwnerMismatch` on ID disagreement.
 */
export class XBookmarksOwnerResolver {
  constructor(
    private readonly client: XBookmarksClient,
    private readonly ownerUsername: string,
    private readonly ownerUserId: string | null,
  ) {}

  resolve(accessToken: string) {
    const client = this.client;
    const ownerUsername = this.ownerUsername;
    const ownerUserId = this.ownerUserId;
    return Effect.gen(function* () {
      const owner = yield* client.getUserByUsername(ownerUsername, accessToken);

      if (
        ownerUserId &&
        owner.id &&
        owner.id.toString() !== ownerUserId.toString()
      ) {
        return yield* Effect.fail(
          new OwnerMismatch({
            message: `Configured X_OWNER_USER_ID (${ownerUserId}) does not match @${ownerUsername} (${owner.id})`,
            tokenStatus: "owner_mismatch",
          }),
        );
      }

      return owner;
    });
  }
}

/**
 * Verifies that the X account authenticated by the current access token
 * matches the configured owner username. Fails with `OwnerMismatch` if
 * the authenticated username differs (case-insensitive comparison).
 */
export class XIdentityVerifier {
  constructor(
    private readonly client: XBookmarksClient,
    private readonly ownerUsername: string,
  ) {}

  verify(accessToken: string) {
    const client = this.client;
    const ownerUsername = this.ownerUsername;
    return Effect.gen(function* () {
      const authenticatedOwner =
        yield* client.getAuthenticatedUser(accessToken);

      if (
        authenticatedOwner.username.toLowerCase() !==
        ownerUsername.toLowerCase()
      ) {
        return yield* Effect.fail(
          new OwnerMismatch({
            message: `Authenticated X account @${authenticatedOwner.username} does not match required owner @${ownerUsername}`,
            tokenStatus: "owner_mismatch",
          }),
        );
      }

      return authenticatedOwner;
    });
  }
}

export type { BookmarkSourceOwner, NormalizedBookmark, XBookmarkFolder };
