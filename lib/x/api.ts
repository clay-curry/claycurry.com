/**
 * Client-side data access layer for the bookmarks API.
 *
 * Extracts fetch + validation logic from the `useBookmarks` hook so it can
 * be tested without React and reused by non-hook consumers.
 *
 * @module
 */
import { Schema } from "effect";
import {
  type BookmarksApiResponse,
  BookmarksApiResponseSchema,
} from "@/lib/x/contracts";
import {
  BOOKMARKS_API_SOURCE_QUERY_PARAM,
  BOOKMARKS_DEBUG_SOURCE_QUERY_PARAM,
  isLiveBookmarksSource,
} from "@/lib/x/debug";

export interface BookmarksFetchParams {
  folderId?: string;
  mockMode?: string | null;
  source?: string | null;
}

/** Build the `/api/x/bookmarks` URL from structured params. */
export function buildBookmarksUrl(params: BookmarksFetchParams = {}): string {
  const searchParams = new URLSearchParams();
  if (params.folderId) searchParams.set("folder", params.folderId);
  if (isLiveBookmarksSource(params.source)) {
    searchParams.set(BOOKMARKS_API_SOURCE_QUERY_PARAM, params.source);
  } else if (params.mockMode) {
    searchParams.set("mock", params.mockMode);
  }
  const qs = searchParams.toString();
  return `/api/x/bookmarks${qs ? `?${qs}` : ""}`;
}

/** Read debug query params from the current URL (SSR-safe). */
export function getBookmarksDebugConfig(): {
  mockMode: string | null;
  source: string | null;
} {
  if (typeof window === "undefined") {
    return { mockMode: null, source: null };
  }
  const searchParams = new URLSearchParams(window.location.search);
  return {
    mockMode: searchParams.get("mock"),
    source: searchParams.get(BOOKMARKS_DEBUG_SOURCE_QUERY_PARAM),
  };
}

const decode = Schema.decodeUnknownSync(BookmarksApiResponseSchema);

/** Fetch bookmarks from the API and validate the response with Effect Schema. */
export async function fetchBookmarks(
  params?: BookmarksFetchParams,
): Promise<BookmarksApiResponse> {
  const url = buildBookmarksUrl(params);
  const res = await fetch(url);
  const json = await res.json();
  return decode(json);
}
