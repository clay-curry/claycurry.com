/**
 * Factory for creating the bookmarks sync service.
 *
 * Chooses between a mock implementation (preproduction without credentials)
 * and a live `BookmarksSyncService` backed by Redis + the X API. This is
 * the main entry point used by API route handlers to obtain a service
 * instance.
 *
 * @module
 */
import { Effect, Layer } from "effect";
import { RedisLayer } from "@/lib/effect/services/redis";
import { BookmarksRepoLive } from "./cache";
import { XBookmarksClient } from "./client";
import { getXRuntimeConfig } from "./config";
import type {
  BookmarksApiResponse,
  BookmarksStatusApiResponse,
} from "./contracts";
import {
  getBundledBookmarksFallbackResponse,
  getMockBookmarksResponse,
  getMockBookmarksStatusResponse,
} from "./mock-bookmarks";
import { BookmarksSyncService } from "./service";

/**
 * Composed layer providing `BookmarksRepo` with its `RedisClient` dependency.
 * Redis connection errors during layer construction become defects (crashes)
 * rather than typed errors — the right semantics for infrastructure failure.
 */
export const BookmarksRepoLayer = BookmarksRepoLive.pipe(
  Layer.provide(RedisLayer),
  Layer.orDie,
);

/**
 * Minimal interface matching the subset of BookmarksSyncService used by route handlers.
 * Methods return Effect programs for composable error handling.
 */
export interface BookmarksSyncServiceLike {
  getBookmarks(
    folderId?: string,
    options?: { forceLive?: boolean },
  ): Effect.Effect<{
    response: BookmarksApiResponse;
    httpStatus: number;
  }>;
  getStatus(): Effect.Effect<BookmarksStatusApiResponse>;
}

function isPreproduction(): boolean {
  const env = process.env.VERCEL_ENV;
  return env !== "production";
}

function hasLiveCredentials(): boolean {
  return !!(
    process.env.X_OAUTH2_CLIENT_ID && process.env.X_OAUTH2_CLIENT_SECRET
  );
}

function createMockSyncService(): BookmarksSyncServiceLike {
  return {
    getBookmarks(folderId?: string, _options?: { forceLive?: boolean }) {
      return Effect.succeed({
        response: getMockBookmarksResponse(folderId),
        httpStatus: 200,
      });
    },
    getStatus() {
      return Effect.succeed(getMockBookmarksStatusResponse());
    },
  };
}

/**
 * Creates a `BookmarksSyncServiceLike` instance appropriate for the current
 * environment.
 *
 * - In **preproduction** without live OAuth credentials: returns a mock
 *   service that serves bundled sample bookmarks (no API calls).
 * - In **production** or when credentials are present: returns a real
 *   `BookmarksSyncService` backed by Redis caching and the X API.
 *
 * The returned service's Effects require no external context — the
 * `BookmarksRepoLayer` is provided internally.
 */
export function createBookmarksSyncService(
  fetchImpl: typeof fetch = fetch,
  options: {
    preferMockFallback?: boolean;
  } = {},
): BookmarksSyncServiceLike {
  if (
    isPreproduction() &&
    options.preferMockFallback !== false &&
    !hasLiveCredentials()
  ) {
    return createMockSyncService();
  }

  const config = getXRuntimeConfig();
  const client = new XBookmarksClient(fetchImpl);

  const service = new BookmarksSyncService({
    config,
    client,
    fetchImpl,
    fallbackResponse: options.preferMockFallback
      ? getBundledBookmarksFallbackResponse
      : undefined,
  });

  return {
    getBookmarks(folderId, opts) {
      return service
        .getBookmarks(folderId, opts)
        .pipe(Effect.provide(BookmarksRepoLayer));
    },
    getStatus() {
      return service.getStatus().pipe(Effect.provide(BookmarksRepoLayer));
    },
  };
}
