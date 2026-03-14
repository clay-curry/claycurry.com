import type { LucideIcon } from "lucide-react";
import type { ComponentType } from "react";
import type { BookmarksDebugSource } from "@/lib/x/debug";

export type DebugPanelTabProps = {
  bookmarksSource: BookmarksDebugSource;
  mockMode: string;
  onBookmarksConfigChange: (next: {
    bookmarksSource?: BookmarksDebugSource;
    mockMode?: string;
  }) => void;
};

export type DebugPanelTabDefinition = {
  id: string;
  label: string;
  icon?: LucideIcon;
  Component: ComponentType<DebugPanelTabProps>;
};
