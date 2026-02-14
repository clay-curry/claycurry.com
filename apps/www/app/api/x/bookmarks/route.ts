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
