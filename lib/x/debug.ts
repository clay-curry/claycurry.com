/**
 * Query parameter constants for controlling the bookmarks API data source.
 *
 * In preproduction, the `source=live` query param forces a live X API sync
 * instead of using mock/cached data. The `bookmarksSource` param is used
 * by the client-side debug UI to persist the selected source.
 *
 * @module
 */

/** Client-side query param for persisting the debug source selection. */
export const BOOKMARKS_DEBUG_SOURCE_QUERY_PARAM = "bookmarksSource";
/** Server-side query param on `/api/x/bookmarks` to force live sync. */
export const BOOKMARKS_API_SOURCE_QUERY_PARAM = "source";
export const BOOKMARKS_LIVE_SOURCE = "live" as const;

export type BookmarksDebugSource = typeof BOOKMARKS_LIVE_SOURCE | "";

/** Type guard: returns `true` if the value is the `"live"` source override. */
export function isLiveBookmarksSource(
  value: string | null | undefined,
): value is typeof BOOKMARKS_LIVE_SOURCE {
  return value === BOOKMARKS_LIVE_SOURCE;
}
