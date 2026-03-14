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
import { Effect } from "effect";
import { BookmarksSnapshotRepository } from "./cache";
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
 * @param fetchImpl - Custom fetch for testing (defaults to global `fetch`).
 * @param options.preferMockFallback - When `true` (default), falls back to
 *   bundled bookmarks if live sync fails. Set to `false` to disable.
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
  const repository = new BookmarksSnapshotRepository();
  const client = new XBookmarksClient(fetchImpl);

  return new BookmarksSyncService({
    config,
    repository,
    client,
    fetchImpl,
    fallbackResponse: options.preferMockFallback
      ? getBundledBookmarksFallbackResponse
      : undefined,
  });
}
