import assert from "node:assert/strict";
import test from "node:test";
import { BookmarksSnapshotRepository } from "./cache";
import { XBookmarksClient } from "./client";
import type { XLiveRuntimeConfig } from "./config";
import type {
  BookmarkSourceOwner,
  BookmarksSnapshotRecord,
  BookmarksSyncStatusRecord,
  LegacyStoredTokens,
  NormalizedBookmark,
  XBookmarkFolder,
  XTokenRecord,
} from "./contracts";
import { BookmarksSyncService } from "./service";

const owner: BookmarkSourceOwner = {
  id: "owner-1",
  username: "clay__curry",
  name: "Clay Curry",
};

const liveConfig: XLiveRuntimeConfig = {
  mode: "live" as const,
  ownerUsername: "clay__curry",
  ownerUserId: "owner-1",
  clientId: "client-id",
  clientSecret: "client-secret",
  ownerSecret: "owner-secret",
  snapshotFreshnessMs: 30 * 60 * 1000,
};

function createBookmark(id: string): NormalizedBookmark {
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

function createTokenRecord(expiresAt: number): XTokenRecord {
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

function createSnapshot(input: {
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

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });
}

class MemoryRepository extends BookmarksSnapshotRepository {
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

class StubBookmarksClient extends XBookmarksClient {
  bookmarks: NormalizedBookmark[] = [createBookmark("fresh-live")];
  folders: XBookmarkFolder[] = [{ id: "folder-1", name: "Favorites" }];
  authenticatedOwner = owner;
  resolvedOwner = owner;

  constructor() {
    super(async () => new Response(null, { status: 200 }));
  }

  async getAuthenticatedUser(
    _accessToken: string,
  ): Promise<BookmarkSourceOwner> {
    return this.authenticatedOwner;
  }

  async getUserByUsername(
    _username: string,
    _accessToken: string,
  ): Promise<BookmarkSourceOwner> {
    return this.resolvedOwner;
  }

  async fetchAllBookmarks(
    _userId: string,
    _accessToken: string,
  ): Promise<NormalizedBookmark[]> {
    return this.bookmarks;
  }

  async fetchBookmarksByFolder(
    _userId: string,
    _folderId: string,
    _accessToken: string,
  ): Promise<NormalizedBookmark[]> {
    return this.bookmarks;
  }

  async fetchBookmarkFolders(
    _userId: string,
    _accessToken: string,
  ): Promise<XBookmarkFolder[]> {
    return this.folders;
  }
}

test("BookmarksSyncService returns a fresh cached snapshot without live sync", async () => {
  const repository = new MemoryRepository();
  repository.snapshot = createSnapshot({
    lastSyncedAt: new Date(Date.now() - 60_000).toISOString(),
    cachedAt: new Date().toISOString(),
    bookmarkId: "cached",
  });

  const service = new BookmarksSyncService({
    config: liveConfig,
    repository,
    client: new StubBookmarksClient(),
    fetchImpl: async () => {
      throw new Error("live token flow should not run");
    },
  });

  const result = await service.getBookmarks();
  assert.equal(result.httpStatus, 200);
  assert.equal(result.response.status, "fresh");
  assert.equal(result.response.bookmarks[0]?.id, "cached");
});

test("BookmarksSyncService serves a stale snapshot when token refresh fails", async () => {
  const repository = new MemoryRepository();
  repository.snapshot = createSnapshot({
    lastSyncedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    cachedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    bookmarkId: "stale-cached",
  });
  repository.tokenRecord = createTokenRecord(Date.now() - 1_000);

  const service = new BookmarksSyncService({
    config: liveConfig,
    repository,
    client: new StubBookmarksClient(),
    fetchImpl: async () =>
      jsonResponse(
        {
          error: "invalid_request",
          error_description: "Value passed for the token was invalid.",
        },
        400,
      ),
  });

  const result = await service.getBookmarks();
  assert.equal(result.httpStatus, 200);
  assert.equal(result.response.status, "stale");
  assert.equal(result.response.isStale, true);
  assert.equal(result.response.bookmarks[0]?.id, "stale-cached");
  assert.match(result.response.error ?? "", /token/i);
  assert.equal(repository.tokenRecord, null);
});

test("BookmarksSyncService returns a typed reauth_required error when no snapshot exists", async () => {
  const repository = new MemoryRepository();
  repository.tokenRecord = createTokenRecord(Date.now() - 1_000);

  const service = new BookmarksSyncService({
    config: liveConfig,
    repository,
    client: new StubBookmarksClient(),
    fetchImpl: async () =>
      jsonResponse(
        {
          error: "invalid_request",
          error_description: "Value passed for the token was invalid.",
        },
        400,
      ),
  });

  const result = await service.getBookmarks();
  assert.equal(result.httpStatus, 503);
  assert.equal(result.response.status, "reauth_required");
  assert.equal(result.response.bookmarks.length, 0);
  assert.equal(repository.tokenRecord, null);
});

test("BookmarksSyncService refreshes an expired token and returns a fresh live snapshot", async () => {
  const repository = new MemoryRepository();
  repository.tokenRecord = createTokenRecord(Date.now() - 1_000);
  const client = new StubBookmarksClient();

  const service = new BookmarksSyncService({
    config: liveConfig,
    repository,
    client,
    fetchImpl: async () =>
      jsonResponse({
        token_type: "bearer",
        expires_in: 7200,
        access_token: "new-access-token",
        refresh_token: "new-refresh-token",
      }),
  });

  const result = await service.getBookmarks();
  assert.equal(result.httpStatus, 200);
  assert.equal(result.response.status, "fresh");
  assert.equal(result.response.bookmarks[0]?.id, "fresh-live");
  assert.equal(repository.tokenRecord?.accessToken, "new-access-token");
  assert.equal(repository.snapshot?.bookmarks[0]?.id, "fresh-live");
});

test("BookmarksSyncService returns owner_mismatch when the token belongs to another account", async () => {
  const repository = new MemoryRepository();
  repository.tokenRecord = createTokenRecord(Date.now() + 60 * 60 * 1000);
  const client = new StubBookmarksClient();
  client.authenticatedOwner = {
    id: "owner-2",
    username: "wrong_account",
    name: "Wrong Account",
  };

  const service = new BookmarksSyncService({
    config: liveConfig,
    repository,
    client,
    fetchImpl: async () => {
      throw new Error("refresh should not be attempted");
    },
  });

  const result = await service.getBookmarks();
  assert.equal(result.httpStatus, 409);
  assert.equal(result.response.status, "owner_mismatch");
  assert.equal(result.response.bookmarks.length, 0);
});

test("BookmarksSyncService promotes a verified legacy token into the owner-scoped store", async () => {
  const repository = new MemoryRepository();
  repository.legacyTokenRecord = {
    access_token: "legacy-access-token",
    refresh_token: "legacy-refresh-token",
    expires_at: Date.now() + 60 * 60 * 1000,
  };
  const client = new StubBookmarksClient();

  const service = new BookmarksSyncService({
    config: liveConfig,
    repository,
    client,
    fetchImpl: async () => {
      throw new Error(
        "refresh should not be attempted for a valid legacy token",
      );
    },
  });

  const result = await service.getBookmarks();
  assert.equal(result.httpStatus, 200);
  assert.equal(result.response.status, "fresh");
  assert.equal(repository.tokenRecord?.owner.username, "clay__curry");
  assert.equal(repository.legacyTokenRecord, null);
});
