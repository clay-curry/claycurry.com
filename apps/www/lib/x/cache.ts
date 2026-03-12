/**
 * @module x/cache
 *
 * Bookmark cache repository backed by RedisService (Effect layer).
 * Eliminates the duplicated Redis/in-memory fallback pattern — the
 * RedisService handles fallback transparently.
 *
 * Preserves the `BookmarksRepository` interface for backward compatibility
 * with `XTokenStore`, `BookmarksSyncService`, and existing tests.
 *
 * Zod validation is applied on read/write to ensure cache integrity.
 *
 * @see lib/services/Redis.ts for the underlying storage abstraction
 */
import { Effect } from "effect";
import type { ZodType } from "zod";
import { RedisService } from "@/lib/services/Redis";
import {
  type BookmarkSourceOwner,
  type BookmarksSnapshotRecord,
  BookmarksSnapshotRecordSchema,
  type BookmarksSyncStatusRecord,
  BookmarksSyncStatusRecordSchema,
  type LegacyStoredTokens,
  LegacyStoredTokensSchema,
  type XTokenRecord,
  XTokenRecordSchema,
} from "./contracts";

const KEYSPACE = "x:v2";
const LEGACY_KEYSPACE = "x";

function ownerToken(ownerUsername: string): string {
  return encodeURIComponent(ownerUsername.toLowerCase());
}

function scopedKey(
  prefix: string,
  ownerUsername: string,
  suffix: string,
): string {
  return `${prefix}${KEYSPACE}:${ownerToken(ownerUsername)}:${suffix}`;
}

function legacyKey(prefix: string, suffix: string): string {
  return `${prefix}${LEGACY_KEYSPACE}:${suffix}`;
}

function snapshotSuffix(folderId?: string): string {
  return folderId ? `snapshots:folder:${folderId}` : "snapshots:all";
}

function buildLegacySnapshot(
  owner: BookmarkSourceOwner,
  bookmarks: BookmarksSnapshotRecord["bookmarks"],
  folders: BookmarksSnapshotRecord["folders"],
  folderId?: string,
): BookmarksSnapshotRecord {
  return BookmarksSnapshotRecordSchema.parse({
    owner,
    folderId: folderId ?? null,
    bookmarks,
    folders,
    lastSyncedAt: null,
    cachedAt: new Date().toISOString(),
    source: "legacy",
  });
}

export interface BookmarksRepository {
  getTokenRecord(ownerUsername: string): Promise<XTokenRecord | null>;
  setTokenRecord(ownerUsername: string, record: XTokenRecord): Promise<void>;
  deleteTokenRecord(ownerUsername: string): Promise<void>;
  getLegacyTokenRecord(): Promise<LegacyStoredTokens | null>;
  deleteLegacyTokenRecord(): Promise<void>;
  getSnapshot(
    owner: BookmarkSourceOwner,
    folderId?: string,
  ): Promise<BookmarksSnapshotRecord | null>;
  setSnapshot(
    ownerUsername: string,
    snapshot: BookmarksSnapshotRecord,
  ): Promise<void>;
  getStatus(ownerUsername: string): Promise<BookmarksSyncStatusRecord | null>;
  setStatus(
    ownerUsername: string,
    status: BookmarksSyncStatusRecord,
  ): Promise<void>;
}

/**
 * Create a BookmarksRepository backed by the Effect RedisService.
 * This must be called within an Effect context where RedisService is available.
 */
export function createEffectRepository(): Effect.Effect<
  BookmarksRepository,
  never,
  RedisService
> {
  return Effect.gen(function* () {
    const redis = yield* RedisService;
    const prefix = redis.keyPrefix;

    async function getValidated<T>(
      key: string,
      schema: ZodType<T>,
    ): Promise<T | null> {
      const raw = await Effect.runPromise(redis.get(key));
      if (!raw) return null;

      try {
        return schema.parse(JSON.parse(raw));
      } catch {
        await Effect.runPromise(redis.del(key));
        return null;
      }
    }

    async function setValidated<T>(
      key: string,
      schema: ZodType<T>,
      value: T,
      ttlSeconds?: number,
    ): Promise<void> {
      const json = JSON.stringify(schema.parse(value));
      await Effect.runPromise(
        redis.set(key, json, ttlSeconds ? { ex: ttlSeconds } : undefined),
      );
    }

    const repository: BookmarksRepository = {
      async getTokenRecord(ownerUsername) {
        return getValidated(
          scopedKey(prefix, ownerUsername, "tokens"),
          XTokenRecordSchema,
        );
      },

      async setTokenRecord(ownerUsername, record) {
        await setValidated(
          scopedKey(prefix, ownerUsername, "tokens"),
          XTokenRecordSchema,
          record,
        );
      },

      async deleteTokenRecord(ownerUsername) {
        await Effect.runPromise(
          redis.del(scopedKey(prefix, ownerUsername, "tokens")),
        );
      },

      async getLegacyTokenRecord() {
        return getValidated(
          legacyKey(prefix, "tokens"),
          LegacyStoredTokensSchema,
        );
      },

      async deleteLegacyTokenRecord() {
        await Effect.runPromise(redis.del(legacyKey(prefix, "tokens")));
      },

      async getSnapshot(owner, folderId?) {
        const stored = await getValidated(
          scopedKey(prefix, owner.username, snapshotSuffix(folderId)),
          BookmarksSnapshotRecordSchema,
        );

        if (stored) return stored;

        // Try legacy migration
        const suffix = folderId ? `bookmarks:folder:${folderId}` : "bookmarks";
        const bookmarks = await getValidated(
          legacyKey(prefix, suffix),
          BookmarksSnapshotRecordSchema.shape.bookmarks,
        );

        if (!bookmarks) return null;

        const folders =
          (await getValidated(
            legacyKey(prefix, "bookmarks:folders"),
            BookmarksSnapshotRecordSchema.shape.folders,
          )) ?? [];

        const snapshot = buildLegacySnapshot(
          owner,
          bookmarks,
          folders,
          folderId,
        );
        await repository.setSnapshot(owner.username, snapshot);
        return snapshot;
      },

      async setSnapshot(ownerUsername, snapshot) {
        await setValidated(
          scopedKey(
            prefix,
            ownerUsername,
            snapshotSuffix(snapshot.folderId ?? undefined),
          ),
          BookmarksSnapshotRecordSchema,
          snapshot,
        );
      },

      async getStatus(ownerUsername) {
        return getValidated(
          scopedKey(prefix, ownerUsername, "status"),
          BookmarksSyncStatusRecordSchema,
        );
      },

      async setStatus(ownerUsername, status) {
        await setValidated(
          scopedKey(prefix, ownerUsername, "status"),
          BookmarksSyncStatusRecordSchema,
          status,
        );
      },
    };

    return repository;
  });
}
