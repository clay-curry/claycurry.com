/**
 * Integration tests for the X module's Effect boundary.
 *
 * Validates that createEffectRepository() works correctly when wired
 * through RedisService (via RedisTest layer).
 */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { Effect } from "effect";
import { RedisService, RedisTest } from "@/lib/services/Redis";
import { createEffectRepository } from "@/lib/x/cache";
import type {
  BookmarkSourceOwner,
  BookmarksSnapshotRecord,
} from "@/lib/x/contracts";

const owner: BookmarkSourceOwner = {
  id: "owner-1",
  username: "testuser",
  name: "Test User",
};

function createSnapshot(bookmarkId: string): BookmarksSnapshotRecord {
  return {
    owner,
    folderId: null,
    bookmarks: [
      {
        id: bookmarkId,
        text: `bookmark ${bookmarkId}`,
        createdAt: "2026-03-10T07:00:00.000Z",
        author: { id: "a1", name: "Author", username: "author" },
        metrics: { likes: 1, retweets: 0, replies: 0, impressions: 10 },
        media: [],
      },
    ],
    folders: [],
    lastSyncedAt: new Date().toISOString(),
    cachedAt: new Date().toISOString(),
    source: "live",
  };
}

describe("X module Effect integration", () => {
  test("createEffectRepository round-trips a snapshot through RedisTest", async () => {
    const snapshot = createSnapshot("rt-1");

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const repo = yield* createEffectRepository();

        const before = yield* Effect.promise(() => repo.getSnapshot(owner));
        assert.equal(before, null);

        yield* Effect.promise(() => repo.setSnapshot(owner.username, snapshot));
        const after = yield* Effect.promise(() => repo.getSnapshot(owner));
        assert.ok(after !== null);
        assert.equal(after.bookmarks[0].id, "rt-1");
        assert.equal(after.owner.username, "testuser");

        return after;
      }).pipe(Effect.provide(RedisTest)),
    );

    assert.ok(result);
  });

  test("createEffectRepository round-trips token records", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const repo = yield* createEffectRepository();

        const before = yield* Effect.promise(() =>
          repo.getTokenRecord("testuser"),
        );
        assert.equal(before, null);

        yield* Effect.promise(() =>
          repo.setTokenRecord("testuser", {
            accessToken: "abc",
            refreshToken: "def",
            expiresAt: Date.now() + 3600_000,
            owner,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastRefreshedAt: null,
          }),
        );

        const after = yield* Effect.promise(() =>
          repo.getTokenRecord("testuser"),
        );
        assert.ok(after !== null);
        assert.equal(after.accessToken, "abc");

        yield* Effect.promise(() => repo.deleteTokenRecord("testuser"));
        const deleted = yield* Effect.promise(() =>
          repo.getTokenRecord("testuser"),
        );
        assert.equal(deleted, null);
      }).pipe(Effect.provide(RedisTest)),
    );
  });

  test("createEffectRepository round-trips status records", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const repo = yield* createEffectRepository();

        const before = yield* Effect.promise(() => repo.getStatus("testuser"));
        assert.equal(before, null);

        yield* Effect.promise(() =>
          repo.setStatus("testuser", {
            configuredOwnerUsername: "testuser",
            configuredOwnerUserId: "owner-1",
            resolvedOwner: owner,
            authenticatedOwner: owner,
            tokenStatus: "valid",
            tokenExpiresAt: new Date(Date.now() + 3600_000).toISOString(),
            lastRefreshedAt: null,
            lastSuccessfulSyncAt: new Date().toISOString(),
            lastAttemptedSyncAt: new Date().toISOString(),
            lastError: null,
          }),
        );

        const after = yield* Effect.promise(() => repo.getStatus("testuser"));
        assert.ok(after !== null);
        assert.equal(after.tokenStatus, "valid");
      }).pipe(Effect.provide(RedisTest)),
    );
  });

  test("RedisTest provides the correct key prefix", async () => {
    const prefix = await Effect.runPromise(
      Effect.gen(function* () {
        const redis = yield* RedisService;
        return redis.keyPrefix;
      }).pipe(Effect.provide(RedisTest)),
    );

    assert.equal(prefix, "test:");
  });
});
