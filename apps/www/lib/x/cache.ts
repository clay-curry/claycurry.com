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

/**
 * @deprecated Use `createEffectRepository()` within an Effect context.
 * Kept for backward compatibility with existing tests.
 */
export class BookmarksSnapshotRepository implements BookmarksRepository {
  private readonly inMemoryStore = new Map<
    string,
    { value: string; expiresAt?: number }
  >();

  private async getRaw(key: string): Promise<string | null> {
    const { getRedisClient } = await import("@/lib/redis");
    const client = await getRedisClient();
    if (client) return await client.get(key);

    const entry = this.inMemoryStore.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt <= Date.now()) {
      this.inMemoryStore.delete(key);
      return null;
    }
    return entry.value;
  }

  private async setRaw(
    key: string,
    value: string,
    ttlSeconds?: number,
  ): Promise<void> {
    const { getRedisClient } = await import("@/lib/redis");
    const client = await getRedisClient();
    if (client) {
      if (ttlSeconds) {
        await client.set(key, value, { EX: ttlSeconds });
      } else {
        await client.set(key, value);
      }
      return;
    }
    this.inMemoryStore.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
    });
  }

  private async deleteRaw(key: string): Promise<void> {
    const { getRedisClient } = await import("@/lib/redis");
    const client = await getRedisClient();
    if (client) {
      await client.del(key);
      return;
    }
    this.inMemoryStore.delete(key);
  }

  private async getValidated<T>(
    key: string,
    schema: ZodType<T>,
  ): Promise<T | null> {
    const raw = await this.getRaw(key);
    if (!raw) return null;
    try {
      return schema.parse(JSON.parse(raw));
    } catch {
      await this.deleteRaw(key);
      return null;
    }
  }

  private async setValidated<T>(
    key: string,
    schema: ZodType<T>,
    value: T,
    ttlSeconds?: number,
  ): Promise<void> {
    const json = JSON.stringify(schema.parse(value));
    await this.setRaw(key, json, ttlSeconds);
  }

  private prefix(): string {
    const vercelEnv = process.env.VERCEL_ENV;
    if (vercelEnv === "production") return "prod:";
    if (vercelEnv === "preview") return "preview:";
    return "dev:";
  }

  async getTokenRecord(ownerUsername: string): Promise<XTokenRecord | null> {
    return this.getValidated(
      scopedKey(this.prefix(), ownerUsername, "tokens"),
      XTokenRecordSchema,
    );
  }

  async setTokenRecord(
    ownerUsername: string,
    record: XTokenRecord,
  ): Promise<void> {
    await this.setValidated(
      scopedKey(this.prefix(), ownerUsername, "tokens"),
      XTokenRecordSchema,
      record,
    );
  }

  async deleteTokenRecord(ownerUsername: string): Promise<void> {
    await this.deleteRaw(scopedKey(this.prefix(), ownerUsername, "tokens"));
  }

  async getLegacyTokenRecord(): Promise<LegacyStoredTokens | null> {
    return this.getValidated(
      legacyKey(this.prefix(), "tokens"),
      LegacyStoredTokensSchema,
    );
  }

  async deleteLegacyTokenRecord(): Promise<void> {
    await this.deleteRaw(legacyKey(this.prefix(), "tokens"));
  }

  async getSnapshot(
    owner: BookmarkSourceOwner,
    folderId?: string,
  ): Promise<BookmarksSnapshotRecord | null> {
    const stored = await this.getValidated(
      scopedKey(this.prefix(), owner.username, snapshotSuffix(folderId)),
      BookmarksSnapshotRecordSchema,
    );
    if (stored) return stored;

    const suffix = folderId ? `bookmarks:folder:${folderId}` : "bookmarks";
    const bookmarks = await this.getValidated(
      legacyKey(this.prefix(), suffix),
      BookmarksSnapshotRecordSchema.shape.bookmarks,
    );
    if (!bookmarks) return null;

    const folders =
      (await this.getValidated(
        legacyKey(this.prefix(), "bookmarks:folders"),
        BookmarksSnapshotRecordSchema.shape.folders,
      )) ?? [];

    const snapshot = buildLegacySnapshot(owner, bookmarks, folders, folderId);
    await this.setSnapshot(owner.username, snapshot);
    return snapshot;
  }

  async setSnapshot(
    ownerUsername: string,
    snapshot: BookmarksSnapshotRecord,
  ): Promise<void> {
    await this.setValidated(
      scopedKey(
        this.prefix(),
        ownerUsername,
        snapshotSuffix(snapshot.folderId ?? undefined),
      ),
      BookmarksSnapshotRecordSchema,
      snapshot,
    );
  }

  async getStatus(
    ownerUsername: string,
  ): Promise<BookmarksSyncStatusRecord | null> {
    return this.getValidated(
      scopedKey(this.prefix(), ownerUsername, "status"),
      BookmarksSyncStatusRecordSchema,
    );
  }

  async setStatus(
    ownerUsername: string,
    status: BookmarksSyncStatusRecord,
  ): Promise<void> {
    await this.setValidated(
      scopedKey(this.prefix(), ownerUsername, "status"),
      BookmarksSyncStatusRecordSchema,
      status,
    );
  }
}
