export const BOOKMARKS_DEBUG_SOURCE_QUERY_PARAM = "bookmarksSource";
export const BOOKMARKS_API_SOURCE_QUERY_PARAM = "source";
export const BOOKMARKS_LIVE_SOURCE = "live" as const;

export type BookmarksDebugSource = typeof BOOKMARKS_LIVE_SOURCE | "";

export function isLiveBookmarksSource(
  value: string | null | undefined,
): value is typeof BOOKMARKS_LIVE_SOURCE {
  return value === BOOKMARKS_LIVE_SOURCE;
}
