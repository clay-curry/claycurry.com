import { Effect } from "effect";
import { BookmarksSnapshotRepository } from "./cache";
import { XBookmarksClient } from "./client";
import type {
  BookmarkSourceOwner,
  BookmarksSnapshotRecord,
  BookmarksSyncStatusRecord,
  LegacyStoredTokens,
  NormalizedBookmark,
  XBookmarkFolder,
  XTokenRecord,
} from "./contracts";

export const owner: BookmarkSourceOwner = {
  id: "owner-1",
  username: "claycurry__",
  name: "Clay Curry",
};

export const liveConfig = {
  mode: "live" as const,
  ownerUsername: "claycurry__",
  ownerUserId: "owner-1",
  clientId: "client-id",
  clientSecret: "client-secret",
  ownerSecret: "owner-secret",
  snapshotFreshnessMs: 30 * 60 * 1000,
};

export function createBookmark(id: string): NormalizedBookmark {
  return {
    id,
    text: `bookmark ${id}`,
    createdAt: "2026-03-10T07:00:00.000Z",
    author: {
      id: "author-1",
      name: "Author",
      username: "author",
    },
    metrics: {
      likes: 1,
      retweets: 2,
      replies: 3,
      impressions: 4,
    },
    media: [],
  };
}

export function createTokenRecord(expiresAt: number): XTokenRecord {
  return {
    accessToken: "stored-access-token",
    refreshToken: "stored-refresh-token",
    expiresAt,
    owner,
    createdAt: "2026-03-10T06:00:00.000Z",
    updatedAt: "2026-03-10T06:00:00.000Z",
    lastRefreshedAt: null,
  };
}

export function createSnapshot(input: {
  lastSyncedAt: string | null;
  cachedAt: string;
  bookmarkId: string;
}): BookmarksSnapshotRecord {
  return {
    owner,
    folderId: null,
    bookmarks: [createBookmark(input.bookmarkId)],
    folders: [],
    lastSyncedAt: input.lastSyncedAt,
    cachedAt: input.cachedAt,
    source: "live",
  };
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export class MemoryRepository extends BookmarksSnapshotRepository {
  tokenRecord: XTokenRecord | null = null;
  legacyTokenRecord: LegacyStoredTokens | null = null;
  snapshot: BookmarksSnapshotRecord | null = null;
  statusRecord: BookmarksSyncStatusRecord | null = null;

  async getTokenRecord(_ownerUsername: string): Promise<XTokenRecord | null> {
    return this.tokenRecord;
  }

  async setTokenRecord(_ownerUsername: string, record: XTokenRecord) {
    this.tokenRecord = record;
  }

  async deleteTokenRecord(_ownerUsername: string): Promise<void> {
    this.tokenRecord = null;
  }

  async getLegacyTokenRecord(): Promise<LegacyStoredTokens | null> {
    return this.legacyTokenRecord;
  }

  async deleteLegacyTokenRecord(): Promise<void> {
    this.legacyTokenRecord = null;
  }

  async getSnapshot(
    _owner: BookmarkSourceOwner,
    _folderId?: string,
  ): Promise<BookmarksSnapshotRecord | null> {
    return this.snapshot;
  }

  async setSnapshot(_ownerUsername: string, snapshot: BookmarksSnapshotRecord) {
    this.snapshot = snapshot;
  }

  async getStatus(
    _ownerUsername: string,
  ): Promise<BookmarksSyncStatusRecord | null> {
    return this.statusRecord;
  }

  async setStatus(_ownerUsername: string, status: BookmarksSyncStatusRecord) {
    this.statusRecord = status;
  }
}

export class StubBookmarksClient extends XBookmarksClient {
  bookmarks: NormalizedBookmark[] = [createBookmark("fresh-live")];
  folders: XBookmarkFolder[] = [{ id: "folder-1", name: "Favorites" }];
  authenticatedOwner = owner;
  resolvedOwner = owner;

  constructor() {
    super(async () => new Response(null, { status: 200 }));
  }

  getAuthenticatedUser(_accessToken: string) {
    return Effect.succeed(this.authenticatedOwner);
  }

  getUserByUsername(_username: string, _accessToken: string) {
    return Effect.succeed(this.resolvedOwner);
  }

  fetchAllBookmarks(_userId: string, _accessToken: string) {
    return Effect.succeed(this.bookmarks);
  }

  fetchBookmarksByFolder(
    _userId: string,
    _folderId: string,
    _accessToken: string,
  ) {
    return Effect.succeed(this.bookmarks);
  }

  fetchBookmarkFolders(_userId: string, _accessToken: string) {
    return Effect.succeed(this.folders);
  }
}

export class StubIdentityClient extends XBookmarksClient {
  constructor(
    private readonly authenticatedUsername: string,
    private readonly resolvedOwnerId = "owner-1",
  ) {
    super(async () => new Response(null, { status: 200 }));
  }

  getAuthenticatedUser(_accessToken: string) {
    return Effect.succeed({
      id: "auth-1",
      username: this.authenticatedUsername,
      name: "Authenticated User",
    });
  }

  getUserByUsername(username: string, _accessToken: string) {
    return Effect.succeed({
      id: this.resolvedOwnerId,
      username,
      name: "Resolved User",
    });
  }
}

export function withEnv<T>(
  overrides: Record<string, string | undefined>,
  run: () => T,
): T {
  const previous = new Map<string, string | undefined>();
  const restore = () => {
    for (const [key, value] of previous) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  };

  for (const [key, value] of Object.entries(overrides)) {
    previous.set(key, process.env[key]);
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  try {
    const result = run();

    if (
      result &&
      typeof result === "object" &&
      "finally" in result &&
      typeof result.finally === "function"
    ) {
      return result.finally(() => restore()) as T;
    }

    restore();
    return result;
  } catch (error) {
    restore();
    throw error;
  }
}
