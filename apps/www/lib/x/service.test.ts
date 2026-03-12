import { expect, test } from "vitest";
import { BookmarksSyncService } from "./service";
import {
  createSnapshot,
  createTokenRecord,
  jsonResponse,
  liveConfig,
  MemoryRepository,
  StubBookmarksClient,
} from "./test-utils";

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
  expect(result.httpStatus).toBe(200);
  expect(result.response.status).toBe("fresh");
  expect(result.response.bookmarks[0]?.id).toBe("cached");
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
  expect(result.httpStatus).toBe(200);
  expect(result.response.status).toBe("stale");
  expect(result.response.isStale).toBe(true);
  expect(result.response.bookmarks[0]?.id).toBe("stale-cached");
  expect(result.response.error ?? "").toMatch(/token/i);
  expect(repository.tokenRecord).toBeNull();
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
  expect(result.httpStatus).toBe(503);
  expect(result.response.status).toBe("reauth_required");
  expect(result.response.bookmarks).toHaveLength(0);
  expect(repository.tokenRecord).toBeNull();
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
  expect(result.httpStatus).toBe(200);
  expect(result.response.status).toBe("fresh");
  expect(result.response.bookmarks[0]?.id).toBe("fresh-live");
  expect(repository.tokenRecord?.accessToken).toBe("new-access-token");
  expect(repository.snapshot?.bookmarks[0]?.id).toBe("fresh-live");
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
  expect(result.httpStatus).toBe(409);
  expect(result.response.status).toBe("owner_mismatch");
  expect(result.response.bookmarks).toHaveLength(0);
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
  expect(result.httpStatus).toBe(200);
  expect(result.response.status).toBe("fresh");
  expect(repository.tokenRecord?.owner.username).toBe("claycurry__");
  expect(repository.legacyTokenRecord).toBeNull();
});
