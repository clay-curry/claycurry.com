"use client";

import { Activity, BookOpen, Bug, KeyRound, Server } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/lib/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/lib/components/ui/tabs";
import { BOOKMARKS_LIVE_SOURCE } from "@/lib/x/debug";
import { BookmarksMockTab } from "./tabs/bookmarks-mock-tab";
import { CredentialsTab } from "./tabs/credentials-tab";
import { InternalApisTab } from "./tabs/internal-apis/internal-apis-tab";
import { TraceTab } from "./tabs/trace-tab";
import type { DebugPanelTabDefinition } from "./types";
import { updateDebugQueryState, useDebugQueryState } from "./url-state";

const DEFAULT_TAB = "bookmarks";

const DEBUG_PANEL_TABS: DebugPanelTabDefinition[] = [
  {
    id: "bookmarks",
    label: "Bookmarks",
    icon: BookOpen,
    Component: BookmarksMockTab,
  },
  {
    id: "credentials",
    label: "Credentials",
    icon: KeyRound,
    Component: CredentialsTab,
  },
  {
    id: "internal-apis",
    label: "Internal APIs",
    icon: Server,
    Component: InternalApisTab,
  },
  {
    id: "trace",
    label: "Trace",
    icon: Activity,
    Component: TraceTab,
  },
];

export function DebugPanel() {
  const { visible, bookmarksSource, mockMode } = useDebugQueryState();
  const [activeTab, setActiveTab] = useState(DEFAULT_TAB);

  const activeBookmarksBadge =
    bookmarksSource === BOOKMARKS_LIVE_SOURCE
      ? "live:x-api"
      : mockMode
        ? `mock:${mockMode}`
        : null;

  if (!visible) return null;

  return (
    <div className="flex flex-col border-t border-amber-500/40 bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3 border-b border-amber-500/25 px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Bug className="size-4 shrink-0 text-amber-500" />
          <span className="truncate text-xs font-semibold uppercase tracking-[0.24em] text-amber-500">
            Debug Panel
          </span>
          {activeBookmarksBadge && (
            <Badge
              variant="outline"
              className="border-amber-500/40 text-[10px] text-amber-500"
            >
              {activeBookmarksBadge}
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-0">
        <div className="border-b border-border/70 px-3 pt-2 sm:px-4">
          <TabsList
            variant="line"
            className="h-auto w-full justify-start gap-1 px-0"
          >
            {DEBUG_PANEL_TABS.map(({ id, label, icon: Icon }) => (
              <TabsTrigger
                key={id}
                value={id}
                className="rounded-md px-3 py-2 text-xs sm:text-sm"
              >
                {Icon ? <Icon className="size-3.5" /> : null}
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="px-3 py-3 sm:px-4 sm:py-4">
          {DEBUG_PANEL_TABS.map(({ id, Component }) => (
            <TabsContent key={id} value={id} className="mt-0">
              <Component
                bookmarksSource={bookmarksSource}
                mockMode={mockMode}
                onBookmarksConfigChange={updateDebugQueryState}
              />
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
