import type { ZodType } from "zod";
import { getRedisClient, keyPrefix } from "@/lib/redis";
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

const inMemoryStore = new Map<string, { value: string; expiresAt?: number }>();
const KEYSPACE = "x:v2";
const LEGACY_KEYSPACE = "x";

function ownerToken(ownerUsername: string): string {
  return encodeURIComponent(ownerUsername.toLowerCase());
}

function scopedKey(ownerUsername: string, suffix: string): string {
  return `${keyPrefix()}${KEYSPACE}:${ownerToken(ownerUsername)}:${suffix}`;
}

function legacyKey(suffix: string): string {
  return `${keyPrefix()}${LEGACY_KEYSPACE}:${suffix}`;
}

function snapshotSuffix(folderId?: string): string {
  return folderId ? `snapshots:folder:${folderId}` : "snapshots:all";
}

async function getRaw(key: string): Promise<string | null> {
  const client = await getRedisClient();
  if (client) {
    return await client.get(key);
  }

  const entry = inMemoryStore.get(key);
  if (!entry) {
    return null;
  }

  if (entry.expiresAt && entry.expiresAt <= Date.now()) {
    inMemoryStore.delete(key);
    return null;
  }

  return entry.value;
}

async function setRaw(
  key: string,
  value: string,
  ttlSeconds?: number,
): Promise<void> {
  const client = await getRedisClient();
  if (client) {
    if (ttlSeconds) {
      await client.set(key, value, { EX: ttlSeconds });
      return;
    }

    await client.set(key, value);
    return;
  }

  inMemoryStore.set(key, {
    value,
    expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
  });
}

async function deleteRaw(key: string): Promise<void> {
  const client = await getRedisClient();
  if (client) {
    await client.del(key);
    return;
  }

  inMemoryStore.delete(key);
}

async function getValidated<T>(
  key: string,
  schema: ZodType<T>,
): Promise<T | null> {
  const raw = await getRaw(key);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return schema.parse(parsed);
  } catch (error) {
    console.error(`Invalid X cache payload for ${key}:`, error);
    await deleteRaw(key);
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
  await setRaw(key, json, ttlSeconds);
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

  async getLegacyTokenRecord(): Promise<LegacyStoredTokens | null> {
    return getValidated(legacyKey("tokens"), LegacyStoredTokensSchema);
  }

  async deleteLegacyTokenRecord(): Promise<void> {
    await deleteRaw(legacyKey("tokens"));
  }

  async getSnapshot(
    owner: BookmarkSourceOwner,
    folderId?: string,
  ): Promise<BookmarksSnapshotRecord | null> {
    const stored = await getValidated(
      scopedKey(owner.username, snapshotSuffix(folderId)),
      BookmarksSnapshotRecordSchema,
    );

    if (stored) {
      return stored;
    }

    return await this.migrateLegacySnapshot(owner, folderId);
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

  private async migrateLegacySnapshot(
    owner: BookmarkSourceOwner,
    folderId?: string,
  ): Promise<BookmarksSnapshotRecord | null> {
    const suffix = folderId ? `bookmarks:folder:${folderId}` : "bookmarks";
    const bookmarks = await getValidated(
      legacyKey(suffix),
      BookmarksSnapshotRecordSchema.shape.bookmarks,
    );

    if (!bookmarks) {
      return null;
    }

    const folders =
      (await getValidated(
        legacyKey("bookmarks:folders"),
        BookmarksSnapshotRecordSchema.shape.folders,
      )) ?? [];

    const snapshot = buildLegacySnapshot(owner, bookmarks, folders, folderId);
    await this.setSnapshot(owner.username, snapshot);
    return snapshot;
  }
}
