import { Effect, Schema } from "effect";
import { appRuntime } from "@/lib/effect/runtime";
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

async function getRaw(key: string): Promise<string | null> {
  return appRuntime.runPromise(
    Effect.gen(function* () {
      const redis = yield* RedisClient;
      return yield* redis.get(key);
    }).pipe(
      Effect.catchTag("RedisError", (err) => {
        console.error(`Redis get error for ${key}:`, err.message);
        return Effect.succeed(null);
      }),
    ),
  );
}

async function setRaw(
  key: string,
  value: string,
  ttlSeconds?: number,
): Promise<void> {
  await appRuntime.runPromise(
    Effect.gen(function* () {
      const redis = yield* RedisClient;
      yield* redis.set(key, value, ttlSeconds ? { EX: ttlSeconds } : undefined);
    }).pipe(
      Effect.catchTag("RedisError", (err) => {
        console.error(`Redis set error for ${key}:`, err.message);
        return Effect.void;
      }),
    ),
  );
}

async function deleteRaw(key: string): Promise<void> {
  await appRuntime.runPromise(
    Effect.gen(function* () {
      const redis = yield* RedisClient;
      yield* redis.del(key);
    }).pipe(
      Effect.catchTag("RedisError", (err) => {
        console.error(`Redis del error for ${key}:`, err.message);
        return Effect.void;
      }),
    ),
  );
}

async function getValidated<A, I>(
  key: string,
  schema: Schema.Schema<A, I>,
): Promise<A | null> {
  const raw = await getRaw(key);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return Schema.decodeUnknownSync(schema)(parsed);
  } catch (error) {
    console.error(`Invalid X cache payload for ${key}:`, error);
    await deleteRaw(key);
    return null;
  }
}

async function setValidated<A, I>(
  key: string,
  schema: Schema.Schema<A, I>,
  value: A,
  ttlSeconds?: number,
): Promise<void> {
  const json = JSON.stringify(Schema.decodeUnknownSync(schema)(value));
  await setRaw(key, json, ttlSeconds);
}

export interface BookmarksRepository {
  getTokenRecord(ownerUsername: string): Promise<XTokenRecord | null>;
  setTokenRecord(ownerUsername: string, record: XTokenRecord): Promise<void>;
  deleteTokenRecord(ownerUsername: string): Promise<void>;
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

export class BookmarksSnapshotRepository implements BookmarksRepository {
  async getTokenRecord(ownerUsername: string): Promise<XTokenRecord | null> {
    return getValidated(scopedKey(ownerUsername, "tokens"), XTokenRecordSchema);
  }

  async setTokenRecord(
    ownerUsername: string,
    record: XTokenRecord,
  ): Promise<void> {
    await setValidated(
      scopedKey(ownerUsername, "tokens"),
      XTokenRecordSchema,
      record,
    );
  }

  async deleteTokenRecord(ownerUsername: string): Promise<void> {
    await deleteRaw(scopedKey(ownerUsername, "tokens"));
  }

  async getSnapshot(
    owner: BookmarkSourceOwner,
    folderId?: string,
  ): Promise<BookmarksSnapshotRecord | null> {
    const stored = await getValidated(
      scopedKey(owner.username, snapshotSuffix(folderId)),
      BookmarksSnapshotRecordSchema,
    );

    return stored;
  }

  async setSnapshot(
    ownerUsername: string,
    snapshot: BookmarksSnapshotRecord,
  ): Promise<void> {
    await setValidated(
      scopedKey(ownerUsername, snapshotSuffix(snapshot.folderId ?? undefined)),
      BookmarksSnapshotRecordSchema,
      snapshot,
    );
  }

  async getStatus(
    ownerUsername: string,
  ): Promise<BookmarksSyncStatusRecord | null> {
    return getValidated(
      scopedKey(ownerUsername, "status"),
      BookmarksSyncStatusRecordSchema,
    );
  }

  async setStatus(
    ownerUsername: string,
    status: BookmarksSyncStatusRecord,
  ): Promise<void> {
    await setValidated(
      scopedKey(ownerUsername, "status"),
      BookmarksSyncStatusRecordSchema,
      status,
    );
  }
}
