"use client";

import { useAtom, useAtomValue } from "jotai";
import { useCallback, useEffect, useState } from "react";
import {
  bookmarkFolderAtom,
  bookmarksDataAtom,
  bookmarksFoldersAtom,
} from "@/lib/x/atoms";
import type { NormalizedBookmark, XBookmarkFolder } from "@/lib/x/client";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useAtom(bookmarksDataAtom);
  const [folders, setFolders] = useAtom(bookmarksFoldersAtom);
  const folder = useAtomValue(bookmarkFolderAtom);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookmarks = useCallback(
    async (folderId?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = folderId ? `?folder=${folderId}` : "";
        const res = await fetch(`/api/x/bookmarks${params}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to fetch bookmarks");
          setBookmarks(data.bookmarks ?? []);
          setFolders(data.folders ?? []);
          return;
        }

        setBookmarks(data.bookmarks as NormalizedBookmark[]);
        setFolders(data.folders as XBookmarkFolder[]);
      } catch {
        setError("Failed to fetch bookmarks");
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

  return { isLoading, error, bookmarks, folders, refetch };
}
