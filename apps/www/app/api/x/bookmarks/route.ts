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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get("folder") || undefined;

  try {
    // Try cache first for bookmarks
    let bookmarks = await getCachedBookmarks(folderId);
    if (!bookmarks) {
      bookmarks = folderId
        ? await fetchBookmarksByFolder(folderId)
        : await fetchAllBookmarks();
      await setCachedBookmarks(bookmarks, folderId);
    }

    // Try cache first for folders
    let folders = await getCachedFolders();
    if (!folders) {
      folders = await fetchBookmarkFolders();
      await setCachedFolders(folders);
    }

    return NextResponse.json({
      bookmarks,
      folders,
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
