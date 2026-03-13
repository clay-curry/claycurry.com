import { BookmarksSnapshotRepository } from "./cache";
import { XBookmarksClient } from "./client";
import { getXRuntimeConfig } from "./config";
import { BookmarksSyncService } from "./service";

export function createBookmarksSyncService(
  fetchImpl: typeof fetch = fetch,
): BookmarksSyncService {
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
