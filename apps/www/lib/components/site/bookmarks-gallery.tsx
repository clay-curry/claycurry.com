"use client";

import { useAtomValue } from "jotai";
import { Bookmark } from "lucide-react";
import { useState } from "react";
import { useBookmarks } from "@/lib/hooks/use-bookmarks";
import { sortedBookmarksAtom } from "@/lib/x/atoms";
import { BookmarkCard } from "./bookmark-card";
import { BookmarkCardSkeleton } from "./bookmark-card-skeleton";
import { BookmarksToolbar } from "./bookmarks-toolbar";

export function BookmarksGallery() {
  const { isLoading, error, folders } = useBookmarks();
  const bookmarks = useAtomValue(sortedBookmarksAtom);
  const [dimViewed, setDimViewed] = useState(false);

  if (isLoading) {
    return (
      <div>
        <BookmarksToolbar
          folders={[]}
          dimViewed={false}
          onToggleDimViewed={() => {}}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {["a", "b", "c", "d", "e", "f"].map((id) => (
            <BookmarkCardSkeleton key={id} />
          ))}
        </div>
      </div>
    );
  }

  if (error && bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Bookmark className="size-8 mb-3 opacity-50" />
        <p className="text-sm">Unable to load bookmarks</p>
        <p className="text-xs mt-1 opacity-70">{error}</p>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Bookmark className="size-8 mb-3 opacity-50" />
        <p className="text-sm">No bookmarks yet</p>
      </div>
    );
  }

  return (
    <div>
      <BookmarksToolbar
        folders={folders}
        dimViewed={dimViewed}
        onToggleDimViewed={() => setDimViewed(!dimViewed)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {bookmarks.map((bookmark) => (
          <BookmarkCard
            key={bookmark.id}
            bookmark={bookmark}
            dimViewed={dimViewed}
          />
        ))}
      </div>
    </div>
  );
}
