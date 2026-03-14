/**
 * Jotai atoms for client-side bookmarks gallery UI state.
 *
 * Persistent atoms use `atomWithStorage` to survive page reloads via
 * localStorage (keys prefixed with `portfolio:bookmarks:`). Ephemeral
 * atoms hold the fetched bookmark data and search query.
 *
 * The derived `sortedBookmarksAtom` applies search filtering, sorting
 * by the selected field/order, and is consumed directly by the gallery
 * component.
 *
 * @module
 */
"use client";

import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { NormalizedBookmark, XBookmarkFolder } from "./client";

/** Sortable bookmark fields. */
export type SortField = "date" | "likes" | "retweets" | "impressions";
/** Sort direction. */
export type SortOrder = "asc" | "desc";

/** Persisted sort field selection (localStorage). */
export const bookmarkSortFieldAtom = atomWithStorage<SortField>(
  "portfolio:bookmarks:sort-field",
  "date",
);

/** Persisted sort order selection (localStorage). */
export const bookmarkSortOrderAtom = atomWithStorage<SortOrder>(
  "portfolio:bookmarks:sort-order",
  "desc",
);

/** Persisted selected folder ID (empty string = all bookmarks). */
export const bookmarkFolderAtom = atomWithStorage<string>(
  "portfolio:bookmarks:folder",
  "",
);

/** Persisted list of viewed bookmark IDs (for "unread" indicators). */
export const bookmarkViewedAtom = atomWithStorage<string[]>(
  "portfolio:bookmarks:viewed",
  [],
);

/** Ephemeral search query text (not persisted). */
export const bookmarkSearchAtom = atom<string>("");

/** Ephemeral atom holding the fetched bookmarks array from the API. */
export const bookmarksDataAtom = atom<NormalizedBookmark[]>([]);
/** Ephemeral atom holding the fetched folders array from the API. */
export const bookmarksFoldersAtom = atom<XBookmarkFolder[]>([]);

/**
 * Derived atom: filters bookmarks by search text (across tweet text,
 * author name, and username), then sorts by the selected field and order.
 */
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
