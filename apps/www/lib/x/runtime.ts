/**
 * @module x/runtime
 *
 * Factory for creating X integration services within an Effect context.
 *
 * `createBookmarksSyncServiceEffect()` creates a BookmarksSyncService
 * backed by the Effect RedisService (no Redis duplication).
 */
import { Effect } from "effect";
import type { RedisService } from "@/lib/services/Redis";
import { createEffectRepository } from "./cache";
import { XBookmarksClient } from "./client";
import { getXRuntimeConfig } from "./config";
import { BookmarksSyncService } from "./service";

/**
 * Create a BookmarksSyncService within an Effect context.
 * The repository is backed by RedisService (automatic fallback).
 */
export function createBookmarksSyncServiceEffect(
  fetchImpl: typeof fetch = fetch,
): Effect.Effect<BookmarksSyncService, never, RedisService> {
  return Effect.gen(function* () {
    const config = getXRuntimeConfig();
    const repository = yield* createEffectRepository();
    const client = new XBookmarksClient(fetchImpl);

    return new BookmarksSyncService({
      config,
      repository,
      client,
      fetchImpl,
    });
  });
}
