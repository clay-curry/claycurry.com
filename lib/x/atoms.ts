"use client";

import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { NormalizedBookmark, XBookmarkFolder } from "./client";

export type SortField = "date" | "likes" | "retweets" | "impressions";
export type SortOrder = "asc" | "desc";

export const bookmarkSortFieldAtom = atomWithStorage<SortField>(
  "portfolio:bookmarks:sort-field",
  "date",
);

export const bookmarkSortOrderAtom = atomWithStorage<SortOrder>(
  "portfolio:bookmarks:sort-order",
  "desc",
);

export const bookmarkFolderAtom = atomWithStorage<string>(
  "portfolio:bookmarks:folder",
  "",
);

export const bookmarkViewedAtom = atomWithStorage<string[]>(
  "portfolio:bookmarks:viewed",
  [],
);

export const bookmarkSearchAtom = atom<string>("");

export const bookmarksDataAtom = atom<NormalizedBookmark[]>([]);
export const bookmarksFoldersAtom = atom<XBookmarkFolder[]>([]);

export const sortedBookmarksAtom = atom((get) => {
  const bookmarks = get(bookmarksDataAtom);
  const sortField = get(bookmarkSortFieldAtom);
  const sortOrder = get(bookmarkSortOrderAtom);
  const search = get(bookmarkSearchAtom).toLowerCase().trim();

  let filtered = bookmarks;

  if (search) {
    filtered = filtered.filter(
      (b) =>
        b.text.toLowerCase().includes(search) ||
        b.author.name.toLowerCase().includes(search) ||
        b.author.username.toLowerCase().includes(search),
    );
  }

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case "date":
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case "likes":
        cmp = a.metrics.likes - b.metrics.likes;
        break;
      case "retweets":
        cmp = a.metrics.retweets - b.metrics.retweets;
        break;
      case "impressions":
        cmp = a.metrics.impressions - b.metrics.impressions;
        break;
    }
    return sortOrder === "asc" ? cmp : -cmp;
  });

  return sorted;
});
