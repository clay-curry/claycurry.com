"use client";

import { useAtom, useAtomValue } from "jotai";
import { useCallback, useEffect, useState } from "react";
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
        const params = folderId ? `?folder=${folderId}` : "";
        const res = await fetch(`/api/x/bookmarks${params}`);
        const json = await res.json();
        if (
          !json ||
          typeof json !== "object" ||
          !Array.isArray(json.bookmarks)
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
