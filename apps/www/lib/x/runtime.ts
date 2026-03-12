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
 * Allows the mock implementation to satisfy the same contract without subclassing.
 */
export interface BookmarksSyncServiceLike {
  getBookmarks(folderId?: string): Promise<{
    response: BookmarksApiResponse;
    httpStatus: number;
  }>;
  getStatus(): Promise<BookmarksStatusApiResponse>;
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
    async getBookmarks(folderId?: string) {
      return {
        response: getMockBookmarksResponse(folderId),
        httpStatus: 200,
      };
    },
    async getStatus() {
      return getMockBookmarksStatusResponse();
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
