import { type NextRequest, NextResponse } from "next/server";
import {
  getCachedBookmarks,
  getCachedFolders,
  setCachedBookmarks,
  setCachedFolders,
} from "@/lib/x/cache";
import {
  fetchAllBookmarks,
  fetchBookmarkFolders,
  fetchBookmarksByFolder,
} from "@/lib/x/client";
import { FAKE_BOOKMARKS, FAKE_FOLDERS } from "@/lib/x/fixtures";

export async function GET(request: NextRequest) {
  // Serve fake data when X credentials aren't configured (localhost dev)
  if (!process.env.X_OWNER_USER_ID) {
    return NextResponse.json({
      bookmarks: FAKE_BOOKMARKS,
      folders: FAKE_FOLDERS,
      cachedAt: new Date().toISOString(),
      fixture: true,
    });
  }

  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get("folder") || undefined;

  try {
    let [bookmarks, folders] = await Promise.all([
      getCachedBookmarks(folderId),
      getCachedFolders(),
    ]);

    const isBookmarksCacheMiss = !bookmarks;
    const isFoldersCacheMiss = !folders;

    if (isBookmarksCacheMiss || isFoldersCacheMiss) {
      const [resolvedBookmarks, resolvedFolders] = await Promise.all([
        bookmarks ??
          (folderId ? fetchBookmarksByFolder(folderId) : fetchAllBookmarks()),
        folders ?? fetchBookmarkFolders(),
      ]);

      bookmarks = resolvedBookmarks;
      folders = resolvedFolders;

      const cacheWrites: Promise<void>[] = [];
      if (isBookmarksCacheMiss) {
        cacheWrites.push(setCachedBookmarks(bookmarks, folderId));
      }
      if (isFoldersCacheMiss) {
        cacheWrites.push(setCachedFolders(folders));
      }

      if (cacheWrites.length > 0) {
        await Promise.all(cacheWrites);
      }
    }

    return NextResponse.json({
      bookmarks: bookmarks ?? [],
      folders: folders ?? [],
      cachedAt: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Bookmarks API error:", message);
    return NextResponse.json(
      { error: message, bookmarks: [], folders: [] },
      { status: 500 },
    );
  }
}
