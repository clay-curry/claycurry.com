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
import { xError } from "./errors";

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
): T {
  try {
    return schema.parse(payload);
  } catch (error) {
    throw xError(
      "schema_invalid",
      `${context} did not match the expected contract`,
      {
        cause: error,
        tokenStatus: "invalid",
      },
    );
  }
}

function normalizeTweets(response: unknown): NormalizedBookmark[] {
  const parsed = parseContract(
    XBookmarksResponseSchema,
    response,
    "bookmarks response",
  );
  if (!parsed.data) {
    return [];
  }

  const usersMap = new Map<string, XUser>();
  for (const user of parsed.includes?.users ?? []) {
    usersMap.set(user.id, user);
  }

  const mediaMap = new Map<string, XMedia>();
  for (const media of parsed.includes?.media ?? []) {
    mediaMap.set(media.media_key, media);
  }

  return parsed.data.map((tweet) =>
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
}

export class XBookmarksClient {
  constructor(private readonly fetchImpl: typeof fetch = fetch) {}

  async getAuthenticatedUser(
    accessToken: string,
  ): Promise<BookmarkSourceOwner> {
    const payload = await this.requestJson(
      "https://api.x.com/2/users/me",
      accessToken,
      "authenticated user lookup",
    );

    return normalizeOwner(
      parseContract(XUserEnvelopeSchema, payload, "authenticated user response")
        .data,
    );
  }

  async getUserByUsername(
    username: string,
    accessToken: string,
  ): Promise<BookmarkSourceOwner> {
    const payload = await this.requestJson(
      `https://api.x.com/2/users/by/username/${encodeURIComponent(username)}`,
      accessToken,
      "owner lookup",
    );

    return normalizeOwner(
      parseContract(XUserEnvelopeSchema, payload, "owner lookup response").data,
    );
  }

  async fetchAllBookmarks(
    userId: string,
    accessToken: string,
  ): Promise<NormalizedBookmark[]> {
    return await this.fetchBookmarksPages(
      userId,
      accessToken,
      (paginationToken) =>
        `https://api.x.com/2/users/${userId}/bookmarks?${BOOKMARKS_FIELDS}${paginationToken ? `&pagination_token=${paginationToken}` : ""}`,
      "bookmark fetch",
    );
  }

  async fetchBookmarksByFolder(
    userId: string,
    folderId: string,
    accessToken: string,
  ): Promise<NormalizedBookmark[]> {
    return await this.fetchBookmarksPages(
      userId,
      accessToken,
      (paginationToken) =>
        `https://api.x.com/2/users/${userId}/bookmarks/folders/${folderId}/tweets?${BOOKMARKS_FIELDS}${paginationToken ? `&pagination_token=${paginationToken}` : ""}`,
      "folder bookmark fetch",
    );
  }

  async fetchBookmarkFolders(
    userId: string,
    accessToken: string,
  ): Promise<XBookmarkFolder[]> {
    const response = await this.fetchImpl(
      `https://api.x.com/2/users/${userId}/bookmarks/folders`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (response.status === 403 || response.status === 404) {
      return [];
    }

    const payload = await this.readJsonResponse(response, "bookmark folders");
    const parsed = parseContract(
      XBookmarkFoldersResponseSchema,
      payload,
      "bookmark folders response",
    );
    return parsed.data ?? [];
  }

  private async fetchBookmarksPages(
    userId: string,
    accessToken: string,
    buildUrl: (paginationToken?: string) => string,
    context: string,
  ): Promise<NormalizedBookmark[]> {
    const allBookmarks: NormalizedBookmark[] = [];
    let paginationToken: string | undefined;

    do {
      const payload = await this.requestJson(
        buildUrl(paginationToken),
        accessToken,
        context,
      );

      const parsed = parseContract(
        XBookmarksResponseSchema,
        payload,
        `${context} response`,
      );
      allBookmarks.push(...normalizeTweets(parsed));
      paginationToken = parsed.meta?.next_token;
    } while (paginationToken);

    return allBookmarks;
  }

  private async requestJson(
    url: string,
    accessToken: string,
    context: string,
  ): Promise<unknown> {
    const response = await this.fetchImpl(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return await this.readJsonResponse(response, context);
  }

  private async readJsonResponse(
    response: Response,
    context: string,
  ): Promise<unknown> {
    if (!response.ok) {
      const body = await response.text();
      const message = `${context} failed (${response.status}): ${body}`;
      if (response.status === 401 || response.status === 403) {
        throw xError("reauth_required", message, {
          tokenStatus: "invalid",
        });
      }

      throw xError("upstream_error", message);
    }

    try {
      return await response.json();
    } catch (error) {
      throw xError("schema_invalid", `${context} returned non-JSON`, {
        cause: error,
        tokenStatus: "invalid",
      });
    }
  }
}

export class XBookmarksOwnerResolver {
  constructor(
    private readonly client: XBookmarksClient,
    private readonly ownerUsername: string,
    private readonly ownerUserId: string | null,
  ) {}

  async resolve(accessToken: string): Promise<BookmarkSourceOwner> {
    const owner = await this.client.getUserByUsername(
      this.ownerUsername,
      accessToken,
    );

    if (
      this.ownerUserId &&
      owner.id &&
      owner.id.toString() !== this.ownerUserId.toString()
    ) {
      throw xError(
        "owner_mismatch",
        `Configured X_OWNER_USER_ID (${this.ownerUserId}) does not match @${this.ownerUsername} (${owner.id})`,
        { tokenStatus: "owner_mismatch" },
      );
    }

    return owner;
  }
}

export class XIdentityVerifier {
  constructor(
    private readonly client: XBookmarksClient,
    private readonly ownerUsername: string,
  ) {}

  async verify(accessToken: string): Promise<BookmarkSourceOwner> {
    const authenticatedOwner =
      await this.client.getAuthenticatedUser(accessToken);

    if (
      authenticatedOwner.username.toLowerCase() !==
      this.ownerUsername.toLowerCase()
    ) {
      throw xError(
        "owner_mismatch",
        `Authenticated X account @${authenticatedOwner.username} does not match required owner @${this.ownerUsername}`,
        { tokenStatus: "owner_mismatch" },
      );
    }

    return authenticatedOwner;
  }
}

export type { BookmarkSourceOwner, NormalizedBookmark, XBookmarkFolder };
