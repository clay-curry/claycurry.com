import { Effect } from "effect";
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

function parseContract<T>(
  schema: { parse: (value: unknown) => T },
  payload: unknown,
  context: string,
) {
  return Effect.try({
    try: () => schema.parse(payload),
    catch: (error) =>
      new SchemaInvalid({
        message: `${context} did not match the expected contract`,
        cause: error,
        tokenStatus: "invalid",
      }),
  });
}

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

export class XBookmarksClient {
  constructor(private readonly fetchImpl: typeof fetch = fetch) {}

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

  fetchAllBookmarks(userId: string, accessToken: string) {
    return this.fetchBookmarksPages(
      userId,
      accessToken,
      (paginationToken) =>
        `https://api.x.com/2/users/${userId}/bookmarks?${BOOKMARKS_FIELDS}${paginationToken ? `&pagination_token=${paginationToken}` : ""}`,
      "bookmark fetch",
    );
  }

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

  private fetchBookmarksPages(
    userId: string,
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
