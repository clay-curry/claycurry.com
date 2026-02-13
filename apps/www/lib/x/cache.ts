import { getRedisClient, keyPrefix } from "@/lib/redis";
import type { NormalizedBookmark, XBookmarkFolder } from "./client";

const CACHE_TTL = 30 * 60; // 30 minutes in seconds
const inMemoryCache = new Map<string, { data: string; expiresAt: number }>();

function cacheKey(suffix: string): string {
  return `${keyPrefix()}x:${suffix}`;
}

async function getFromCache<T>(key: string): Promise<T | null> {
  const client = await getRedisClient();
  if (client) {
    const raw = await client.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  const entry = inMemoryCache.get(key);
  if (entry && entry.expiresAt > Date.now()) {
    return JSON.parse(entry.data) as T;
  }
  inMemoryCache.delete(key);
  return null;
}

async function setInCache(key: string, data: unknown): Promise<void> {
  const json = JSON.stringify(data);
  const client = await getRedisClient();
  if (client) {
    await client.set(key, json, { EX: CACHE_TTL });
    return;
  }

  inMemoryCache.set(key, {
    data: json,
    expiresAt: Date.now() + CACHE_TTL * 1000,
  });
}

export async function getCachedBookmarks(
  folderId?: string,
): Promise<NormalizedBookmark[] | null> {
  const suffix = folderId ? `bookmarks:folder:${folderId}` : "bookmarks";
  return getFromCache<NormalizedBookmark[]>(cacheKey(suffix));
}

export async function setCachedBookmarks(
  bookmarks: NormalizedBookmark[],
  folderId?: string,
): Promise<void> {
  const suffix = folderId ? `bookmarks:folder:${folderId}` : "bookmarks";
  await setInCache(cacheKey(suffix), bookmarks);
}

export async function getCachedFolders(): Promise<XBookmarkFolder[] | null> {
  return getFromCache<XBookmarkFolder[]>(cacheKey("bookmarks:folders"));
}

export async function setCachedFolders(
  folders: XBookmarkFolder[],
): Promise<void> {
  await setInCache(cacheKey("bookmarks:folders"), folders);
}
