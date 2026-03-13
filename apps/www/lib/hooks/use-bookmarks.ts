"use client";

import { useAtom, useAtomValue } from "jotai";
import { useCallback, useEffect, useState } from "react";
import { DEBUG_BOOKMARKS_CONFIG_CHANGE_EVENT } from "@/lib/components/site/debug-panel/url-state";
import {
  bookmarkFolderAtom,
  bookmarksDataAtom,
  bookmarksFoldersAtom,
} from "@/lib/x/atoms";
import type {
  BookmarkSourceOwner,
  BookmarksApiResponse,
  BookmarksApiStatus,
} from "@/lib/x/contracts";
import {
  BOOKMARKS_API_SOURCE_QUERY_PARAM,
  BOOKMARKS_DEBUG_SOURCE_QUERY_PARAM,
  isLiveBookmarksSource,
} from "@/lib/x/debug";

function getBookmarksDebugConfig() {
  if (typeof window === "undefined") {
    return {
      mockMode: null,
      source: null,
    };
  }

  const searchParams = new URLSearchParams(window.location.search);
  return {
    mockMode: searchParams.get("mock"),
    source: searchParams.get(BOOKMARKS_DEBUG_SOURCE_QUERY_PARAM),
  };
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useAtom(bookmarksDataAtom);
  const [folders, setFolders] = useAtom(bookmarksFoldersAtom);
  const folder = useAtomValue(bookmarkFolderAtom);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<BookmarksApiStatus>("fresh");
  const [isStale, setIsStale] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [owner, setOwner] = useState<BookmarkSourceOwner | null>(null);

  const fetchBookmarks = useCallback(
    async (folderId?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (folderId) params.set("folder", folderId);
        const { mockMode, source } = getBookmarksDebugConfig();
        if (isLiveBookmarksSource(source)) {
          params.set(BOOKMARKS_API_SOURCE_QUERY_PARAM, source);
        } else if (mockMode) {
          params.set("mock", mockMode);
        }
        const qs = params.toString();
        const res = await fetch(`/api/x/bookmarks${qs ? `?${qs}` : ""}`);
        const json = await res.json();
        if (
          !json ||
          typeof json !== "object" ||
          !Array.isArray(json.bookmarks) ||
          !Array.isArray(json.folders) ||
          typeof json.status !== "string" ||
          typeof json.isStale !== "boolean" ||
          !json.owner ||
          typeof json.owner.username !== "string"
        ) {
          setError("Bookmarks response did not match the expected contract");
          setBookmarks([]);
          setFolders([]);
          setStatus("schema_invalid");
          setIsStale(false);
          setLastSyncedAt(null);
          setOwner(null);
          return;
        }

        const data = json as BookmarksApiResponse;
        setBookmarks(data.bookmarks);
        setFolders(data.folders);
        setStatus(data.status);
        setIsStale(data.isStale);
        setLastSyncedAt(data.lastSyncedAt);
        setOwner(data.owner);

        if (!res.ok) {
          setError(data.error || "Failed to fetch bookmarks");
          return;
        }
        setError(data.error ?? null);
      } catch {
        setError("Failed to fetch bookmarks");
        setStatus("upstream_error");
        setIsStale(false);
        setLastSyncedAt(null);
        setOwner(null);
      } finally {
        setIsLoading(false);
      }
    },
    [setBookmarks, setFolders],
  );

  useEffect(() => {
    fetchBookmarks(folder || undefined);
  }, [folder, fetchBookmarks]);

  // Re-fetch when the debug panel changes the bookmarks source config.
  useEffect(() => {
    const handler = () => fetchBookmarks(folder || undefined);
    window.addEventListener(DEBUG_BOOKMARKS_CONFIG_CHANGE_EVENT, handler);
    return () =>
      window.removeEventListener(DEBUG_BOOKMARKS_CONFIG_CHANGE_EVENT, handler);
  }, [folder, fetchBookmarks]);

  const refetch = useCallback(() => {
    fetchBookmarks(folder || undefined);
  }, [folder, fetchBookmarks]);

  return {
    isLoading,
    error,
    bookmarks,
    folders,
    status,
    isStale,
    lastSyncedAt,
    owner,
    refetch,
  };
}
