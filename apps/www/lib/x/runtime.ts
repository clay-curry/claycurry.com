import { Effect } from "effect";
import { BookmarksSnapshotRepository } from "./cache";
import { XBookmarksClient } from "./client";
import { getXRuntimeConfig } from "./config";
import type {
  BookmarksApiResponse,
  BookmarksStatusApiResponse,
} from "./contracts";
import {
  getMockBookmarksResponse,
  getMockBookmarksStatusResponse,
} from "./mock-bookmarks";
import { BookmarksSyncService } from "./service";

/**
 * Minimal interface matching the subset of BookmarksSyncService used by route handlers.
 * Methods return Effect programs for composable error handling.
 */
export interface BookmarksSyncServiceLike {
  getBookmarks(folderId?: string): Effect.Effect<{
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
  return !!(process.env.X_CLIENT_ID && process.env.X_CLIENT_SECRET);
}

function createMockSyncService(): BookmarksSyncServiceLike {
  return {
    getBookmarks(folderId?: string) {
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

export function createBookmarksSyncService(
  fetchImpl: typeof fetch = fetch,
): BookmarksSyncServiceLike {
  if (isPreproduction() && !hasLiveCredentials()) {
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
  });
}
