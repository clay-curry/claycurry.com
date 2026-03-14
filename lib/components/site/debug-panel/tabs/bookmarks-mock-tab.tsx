"use client";

import { Badge } from "@/lib/components/ui/badge";
import { BOOKMARKS_LIVE_SOURCE } from "@/lib/x/debug";
import { MOCK_SCENARIOS } from "@/lib/x/mock-bookmarks";
import type { DebugPanelTabProps } from "../types";

export function BookmarksMockTab({
  bookmarksSource,
  mockMode,
  onBookmarksConfigChange,
}: DebugPanelTabProps) {
  const activeLabel =
    bookmarksSource === BOOKMARKS_LIVE_SOURCE ? "live x api" : mockMode;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Bookmarks data source
        </p>
        {activeLabel ? (
          <Badge variant="outline" className="text-[10px]">
            active: {activeLabel}
          </Badge>
        ) : null}
      </div>

      <div className="space-y-1 rounded-xl border border-border/70 bg-background/70 p-2">
        <label className="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-secondary/60">
          <input
            type="radio"
            name="bookmarks-source"
            value="default"
            checked={mockMode === "" && bookmarksSource === ""}
            onChange={() =>
              onBookmarksConfigChange({
                bookmarksSource: "",
                mockMode: "",
              })
            }
            className="mt-0.5 accent-amber-500"
          />
          <div>
            <p className="text-xs font-medium text-foreground">Default</p>
            <p className="text-[11px] text-muted-foreground">
              Normal service behavior with the live pipeline or local fallback.
            </p>
          </div>
        </label>

        <label className="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-secondary/60">
          <input
            type="radio"
            name="bookmarks-source"
            value={BOOKMARKS_LIVE_SOURCE}
            checked={bookmarksSource === BOOKMARKS_LIVE_SOURCE}
            onChange={() =>
              onBookmarksConfigChange({
                bookmarksSource: BOOKMARKS_LIVE_SOURCE,
                mockMode: "",
              })
            }
            className="mt-0.5 accent-amber-500"
          />
          <div>
            <p className="text-xs font-medium text-foreground">Live X API</p>
            <p className="text-[11px] text-muted-foreground">
              Forces a live sync attempt against X instead of serving a fresh
              cached snapshot.
            </p>
          </div>
        </label>

        {MOCK_SCENARIOS.map((scenario) => (
          <label
            key={scenario.value}
            className="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-secondary/60"
          >
            <input
              type="radio"
              name="bookmarks-source"
              value={scenario.value}
              checked={
                bookmarksSource !== BOOKMARKS_LIVE_SOURCE &&
                mockMode === scenario.value
              }
              onChange={() =>
                onBookmarksConfigChange({
                  bookmarksSource: "",
                  mockMode: scenario.value,
                })
              }
              className="mt-0.5 accent-amber-500"
            />
            <div>
              <p className="text-xs font-medium text-foreground">
                {scenario.label}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {scenario.description}
              </p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
