"use client";

import { useAtomValue } from "jotai";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/lib/components/ui/alert";
import { useBookmarks } from "@/lib/hooks/use-bookmarks";
import { sortedBookmarksAtom } from "@/lib/x/atoms";
import { BookmarkCard } from "./bookmark-card";
import { BookmarkCardSkeleton } from "./bookmark-card-skeleton";
import { BookmarksToolbar } from "./bookmarks-toolbar";

function formatSyncTimestamp(value: string | null): string {
  if (!value) {
    return "an unknown time";
  }

  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function BookmarksGallery() {
  const { isLoading, error, folders, isStale, lastSyncedAt, owner } =
    useBookmarks();
  const bookmarks = useAtomValue(sortedBookmarksAtom);
  const [dimViewed, setDimViewed] = useState(false);
  const staleTitle = lastSyncedAt
    ? "Showing cached bookmarks"
    : "Showing available bookmarks";
  const staleMessage = lastSyncedAt ? (
    <p>
      Live sync failed, so this view is using the most recent cached snapshot
      from {formatSyncTimestamp(lastSyncedAt)}.
    </p>
  ) : (
    <p>
      Live sync is unavailable, so this view is showing the latest available
      bookmark set.
    </p>
  );

  const statusNotice = isStale ? (
    <Alert className="mb-4 border-amber-500/40 bg-amber-500/5 text-amber-200">
      <AlertTriangle className="size-4" />
      <AlertTitle>{staleTitle}</AlertTitle>
      <AlertDescription>
        {staleMessage}
        {owner && (
          <p>
            Required owner:{" "}
            <span className="font-medium">@{owner.username}</span>
          </p>
        )}
      </AlertDescription>
    </Alert>
  ) : null;

  const refreshErrorNotice =
    error && bookmarks.length > 0 && !isStale ? (
      <Alert className="mb-4 border-border/70 bg-secondary/60">
        <AlertTriangle className="size-4" />
        <AlertTitle>Showing previous results</AlertTitle>
        <AlertDescription>
          <p>{error}</p>
        </AlertDescription>
      </Alert>
    ) : null;

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

  if (error && bookmarks.length === 0 && !isStale) {
    return (
      <div>
        {statusNotice}
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-8 mb-3 opacity-50 fill-current"
          >
            <g>
              <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"></path>
            </g>
          </svg>
          <p className="text-sm">Unable to load bookmarks</p>
          <p className="text-xs mt-1 opacity-70">{error}</p>
        </div>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div>
        {statusNotice}
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-8 mb-3 opacity-50 fill-current"
          >
            <g>
              <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"></path>
            </g>
          </svg>
          <p className="text-sm">No bookmarks yet</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {statusNotice}
      {refreshErrorNotice}
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
