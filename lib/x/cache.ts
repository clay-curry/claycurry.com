/**
 * Redis-backed persistence layer for X bookmarks data.
 *
 * Provides typed read/write operations for three record types:
 * - **Token records** — OAuth access/refresh tokens keyed by owner username.
 * - **Snapshot records** — Point-in-time bookmark + folder snapshots.
 * - **Status records** — Sync health metadata (token status, last error, etc.).
 *
 * All keys are namespaced under `{env-prefix}x:v2:{owner}:` to support
 * multi-environment deployments (dev/preview/prod).
 *
 * `BookmarksRepo` is an Effect `Context.Tag` service backed by `RedisClient`.
 * Methods return `Effect` programs — no `appRuntime.runPromise()` bridge.
 *
 * @see https://effect.website/docs/getting-started/using-generators
 * @module
 */
import { Context, Effect, Layer, Schema } from "effect";
import type { RedisError } from "@/lib/effect/services/redis";
import { keyPrefix, RedisClient } from "@/lib/effect/services/redis";
import {
  type BookmarkSourceOwner,
  type BookmarksSnapshotRecord,
  BookmarksSnapshotRecordSchema,
  type BookmarksSyncStatusRecord,
  BookmarksSyncStatusRecordSchema,
  type XTokenRecord,
  XTokenRecordSchema,
} from "./contracts";

const KEYSPACE = "x:v2";

function ownerToken(ownerUsername: string): string {
  return encodeURIComponent(ownerUsername.toLowerCase());
}

function scopedKey(ownerUsername: string, suffix: string): string {
  return `${keyPrefix()}${KEYSPACE}:${ownerToken(ownerUsername)}:${suffix}`;
}

function snapshotSuffix(folderId?: string): string {
  return folderId ? `snapshots:folder:${folderId}` : "snapshots:all";
}

// ============================================================
// Effect-based Redis helpers (no appRuntime bridge)
// ============================================================

function getRaw(
  redis: Context.Tag.Service<typeof RedisClient>,
  key: string,
): Effect.Effect<string | null> {
  return redis.get(key).pipe(
    Effect.catchTag("RedisError", (err) => {
      console.error(`Redis get error for ${key}:`, err.message);
      return Effect.succeed(null);
    }),
  );
}

function setRaw(
  redis: Context.Tag.Service<typeof RedisClient>,
  key: string,
  value: string,
  ttlSeconds?: number,
): Effect.Effect<void> {
  return redis
    .set(key, value, ttlSeconds ? { EX: ttlSeconds } : undefined)
    .pipe(
      Effect.catchTag("RedisError", (err) => {
        console.error(`Redis set error for ${key}:`, err.message);
        return Effect.void;
      }),
    );
}

function delRaw(
  redis: Context.Tag.Service<typeof RedisClient>,
  key: string,
): Effect.Effect<void> {
  return redis.del(key).pipe(
    Effect.catchTag("RedisError", (err) => {
      console.error(`Redis del error for ${key}:`, err.message);
      return Effect.void;
    }),
  );
}

function getValidated<A, I>(
  redis: Context.Tag.Service<typeof RedisClient>,
  key: string,
  schema: Schema.Schema<A, I>,
): Effect.Effect<A | null> {
  return Effect.gen(function* () {
    const raw = yield* getRaw(redis, key);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      return Schema.decodeUnknownSync(schema)(parsed);
    } catch (error) {
      console.error(`Invalid X cache payload for ${key}:`, error);
      yield* delRaw(redis, key);
      return null;
    }
  });
}

function setValidated<A, I>(
  redis: Context.Tag.Service<typeof RedisClient>,
  key: string,
  schema: Schema.Schema<A, I>,
  value: A,
  ttlSeconds?: number,
): Effect.Effect<void> {
  const json = JSON.stringify(Schema.decodeUnknownSync(schema)(value));
  return setRaw(redis, key, json, ttlSeconds);
}

// ============================================================
// BookmarksRepo Effect Service
// ============================================================

export interface BookmarksRepoService {
  readonly getTokenRecord: (
    ownerUsername: string,
  ) => Effect.Effect<XTokenRecord | null>;
  readonly setTokenRecord: (
    ownerUsername: string,
    record: XTokenRecord,
  ) => Effect.Effect<void>;
  readonly deleteTokenRecord: (ownerUsername: string) => Effect.Effect<void>;
  readonly getSnapshot: (
    owner: BookmarkSourceOwner,
    folderId?: string,
  ) => Effect.Effect<BookmarksSnapshotRecord | null>;
  readonly setSnapshot: (
    ownerUsername: string,
    snapshot: BookmarksSnapshotRecord,
  ) => Effect.Effect<void>;
  readonly getStatus: (
    ownerUsername: string,
  ) => Effect.Effect<BookmarksSyncStatusRecord | null>;
  readonly setStatus: (
    ownerUsername: string,
    status: BookmarksSyncStatusRecord,
  ) => Effect.Effect<void>;
}

export class BookmarksRepo extends Context.Tag("BookmarksRepo")<
  BookmarksRepo,
  BookmarksRepoService
>() {}

// ============================================================
// Live Layer (depends on RedisClient)
// ============================================================

export const BookmarksRepoLive: Layer.Layer<
  BookmarksRepo,
  RedisError,
  RedisClient
> = Layer.effect(
  BookmarksRepo,
  Effect.gen(function* () {
    const redis = yield* RedisClient;

    return BookmarksRepo.of({
      getTokenRecord: (ownerUsername) =>
        getValidated(
          redis,
          scopedKey(ownerUsername, "tokens"),
          XTokenRecordSchema,
        ),

      setTokenRecord: (ownerUsername, record) =>
        setValidated(
          redis,
          scopedKey(ownerUsername, "tokens"),
          XTokenRecordSchema,
          record,
        ),

      deleteTokenRecord: (ownerUsername) =>
        delRaw(redis, scopedKey(ownerUsername, "tokens")),

      getSnapshot: (owner, folderId) =>
        getValidated(
          redis,
          scopedKey(owner.username, snapshotSuffix(folderId)),
          BookmarksSnapshotRecordSchema,
        ),

      setSnapshot: (ownerUsername, snapshot) =>
        setValidated(
          redis,
          scopedKey(
            ownerUsername,
            snapshotSuffix(snapshot.folderId ?? undefined),
          ),
          BookmarksSnapshotRecordSchema,
          snapshot,
        ),

      getStatus: (ownerUsername) =>
        getValidated(
          redis,
          scopedKey(ownerUsername, "status"),
          BookmarksSyncStatusRecordSchema,
        ),

      setStatus: (ownerUsername, status) =>
        setValidated(
          redis,
          scopedKey(ownerUsername, "status"),
          BookmarksSyncStatusRecordSchema,
          status,
        ),
    });
  }),
);
