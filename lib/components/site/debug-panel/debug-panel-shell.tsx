"use client";

import {
  Activity,
  BookOpen,
  Bug,
  KeyRound,
  Minus,
  Server,
  X,
} from "lucide-react";
import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Badge } from "@/lib/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/lib/components/ui/tabs";
import { cn } from "@/lib/utils";
import { BOOKMARKS_LIVE_SOURCE } from "@/lib/x/debug";
import { BookmarksMockTab } from "./tabs/bookmarks-mock-tab";
import { CredentialsTab } from "./tabs/credentials-tab";
import { InternalApisTab } from "./tabs/internal-apis/internal-apis-tab";
import { TraceTab } from "./tabs/trace-tab";
import type { DebugPanelTabDefinition } from "./types";
import {
  clearDebugQueryState,
  updateDebugQueryState,
  useDebugQueryState,
} from "./url-state";
import {
  clampBounds,
  DEBUG_PANEL_MIN_HEIGHT,
  DEBUG_PANEL_MIN_WIDTH,
  DEBUG_PANEL_WINDOW_GUTTER,
  type DebugPanelBounds,
  type DebugPanelResizeHandle,
  type DebugPanelSizeConstraints,
  moveBounds,
  resizeBoundsFromHandle,
} from "./windowing";

const DEFAULT_TAB = "bookmarks";
const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

type DebugPanelInteraction =
  | {
      mode: "drag";
      pointerId: number;
      startBounds: DebugPanelBounds;
      startPointer: { x: number; y: number };
    }
  | {
      handle: DebugPanelResizeHandle;
      mode: "resize";
      pointerId: number;
      startBounds: DebugPanelBounds;
      startPointer: { x: number; y: number };
    };

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

const RESIZE_HANDLES: Array<{
  className: string;
  cursor: string;
  handle: DebugPanelResizeHandle;
}> = [
  {
    className: "absolute inset-y-5 left-0 z-20 w-2 cursor-ew-resize",
    cursor: "ew-resize",
    handle: "left",
  },
  {
    className: "absolute inset-y-5 right-0 z-20 w-2 cursor-ew-resize",
    cursor: "ew-resize",
    handle: "right",
  },
  {
    className: "absolute inset-x-5 bottom-0 z-20 h-2 cursor-ns-resize",
    cursor: "ns-resize",
    handle: "bottom",
  },
  {
    className: "absolute left-0 top-0 z-20 size-3 cursor-nwse-resize",
    cursor: "nwse-resize",
    handle: "top-left",
  },
  {
    className: "absolute right-0 top-0 z-20 size-3 cursor-nesw-resize",
    cursor: "nesw-resize",
    handle: "top-right",
  },
  {
    className: "absolute bottom-0 left-0 z-20 size-3 cursor-nesw-resize",
    cursor: "nesw-resize",
    handle: "bottom-left",
  },
  {
    className: "absolute bottom-0 right-0 z-20 size-3 cursor-nwse-resize",
    cursor: "nwse-resize",
    handle: "bottom-right",
  },
];

function getViewport() {
  return {
    height: window.innerHeight,
    width: window.innerWidth,
  };
}

function getWindowConstraints(): DebugPanelSizeConstraints {
  return {
    gutter: DEBUG_PANEL_WINDOW_GUTTER,
    minHeight: DEBUG_PANEL_MIN_HEIGHT,
    minWidth: DEBUG_PANEL_MIN_WIDTH,
    viewport: getViewport(),
  };
}

function rectToBounds(rect: DOMRect): DebugPanelBounds {
  return {
    height: rect.height,
    width: rect.width,
    x: rect.left,
    y: rect.top,
  };
}

function canStartWindowInteraction(event: ReactPointerEvent<HTMLElement>) {
  return event.button === 0 && event.isPrimary;
}

function getResizeCursor(handle: DebugPanelResizeHandle) {
  switch (handle) {
    case "left":
    case "right":
      return "ew-resize";
    case "bottom":
      return "ns-resize";
    case "top-left":
    case "bottom-right":
      return "nwse-resize";
    case "top-right":
    case "bottom-left":
      return "nesw-resize";
    default:
      return "default";
  }
}

export function DebugPanel() {
  const { visible, bookmarksSource, mockMode } = useDebugQueryState();
  const [collapsed, setCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState(DEFAULT_TAB);
  const [bounds, setBounds] = useState<DebugPanelBounds | null>(null);
  const [supportsWindowing, setSupportsWindowing] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const boundsRef = useRef<DebugPanelBounds | null>(null);
  const interactionRef = useRef<DebugPanelInteraction | null>(null);
  const cleanupListenersRef = useRef<(() => void) | null>(null);
  const rafRef = useRef(0);
  const pendingBoundsRef = useRef<DebugPanelBounds | null>(null);
  const bodyStyleRef = useRef<{ cursor: string; userSelect: string } | null>(
    null,
  );

  const cancelScheduledBounds = useCallback(() => {
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }

    pendingBoundsRef.current = null;
  }, []);

  const commitBounds = useCallback(
    (nextBounds: DebugPanelBounds | null) => {
      cancelScheduledBounds();
      boundsRef.current = nextBounds;
      setBounds(nextBounds);
    },
    [cancelScheduledBounds],
  );

  const restoreDocumentStyles = useCallback(() => {
    if (!bodyStyleRef.current) return;

    document.body.style.cursor = bodyStyleRef.current.cursor;
    document.body.style.userSelect = bodyStyleRef.current.userSelect;
    bodyStyleRef.current = null;
  }, []);

  const stopInteraction = useCallback(() => {
    cleanupListenersRef.current?.();
    cleanupListenersRef.current = null;
    interactionRef.current = null;
    restoreDocumentStyles();
  }, [restoreDocumentStyles]);

  const resetWindowState = useCallback(() => {
    cancelScheduledBounds();
    stopInteraction();
    commitBounds(null);
  }, [cancelScheduledBounds, commitBounds, stopInteraction]);

  const scheduleBounds = useCallback((nextBounds: DebugPanelBounds) => {
    pendingBoundsRef.current = nextBounds;

    if (rafRef.current) {
      return;
    }

    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = 0;

      if (!pendingBoundsRef.current) {
        return;
      }

      const scheduledBounds = pendingBoundsRef.current;
      pendingBoundsRef.current = null;
      boundsRef.current = scheduledBounds;
      setBounds(scheduledBounds);
    });
  }, []);

  const startWindowInteraction = (
    event: ReactPointerEvent<HTMLElement>,
    mode: DebugPanelInteraction["mode"],
    handle?: DebugPanelResizeHandle,
  ) => {
    if (!supportsWindowing || !canStartWindowInteraction(event)) {
      return;
    }

    if (mode === "resize" && !handle) {
      return;
    }

    const panel = panelRef.current;
    if (!panel) {
      return;
    }

    resetWindowState();

    const startBounds = clampBounds(
      rectToBounds(panel.getBoundingClientRect()),
      getViewport(),
      DEBUG_PANEL_WINDOW_GUTTER,
      {
        minHeight: DEBUG_PANEL_MIN_HEIGHT,
        minWidth: DEBUG_PANEL_MIN_WIDTH,
      },
    );
    const resizeHandle = mode === "resize" ? handle : undefined;
    const cursor =
      mode === "drag" || !resizeHandle ? "move" : getResizeCursor(resizeHandle);

    commitBounds(startBounds);
    if (mode === "drag") {
      interactionRef.current = {
        mode,
        pointerId: event.pointerId,
        startBounds,
        startPointer: { x: event.clientX, y: event.clientY },
      };
    } else {
      const resolvedHandle = handle;
      if (!resolvedHandle) {
        return;
      }

      interactionRef.current = {
        handle: resolvedHandle,
        mode,
        pointerId: event.pointerId,
        startBounds,
        startPointer: { x: event.clientX, y: event.clientY },
      };
    }

    bodyStyleRef.current = {
      cursor: document.body.style.cursor,
      userSelect: document.body.style.userSelect,
    };
    document.body.style.cursor = cursor;
    document.body.style.userSelect = "none";

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const interaction = interactionRef.current;
      if (!interaction || interaction.pointerId !== moveEvent.pointerId) {
        return;
      }

      const delta = {
        x: moveEvent.clientX - interaction.startPointer.x,
        y: moveEvent.clientY - interaction.startPointer.y,
      };
      const constraints = getWindowConstraints();
      const nextBounds =
        interaction.mode === "drag"
          ? moveBounds(interaction.startBounds, delta, constraints)
          : resizeBoundsFromHandle(
              interaction.startBounds,
              delta,
              interaction.handle,
              constraints,
            );

      scheduleBounds(nextBounds);
      moveEvent.preventDefault();
    };

    const finishInteraction = (pointerId: number) => {
      const interaction = interactionRef.current;
      if (!interaction || interaction.pointerId !== pointerId) {
        return;
      }

      commitBounds(
        pendingBoundsRef.current ??
          boundsRef.current ??
          interaction.startBounds,
      );
      stopInteraction();
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      finishInteraction(upEvent.pointerId);
    };

    const handlePointerCancel = (cancelEvent: PointerEvent) => {
      finishInteraction(cancelEvent.pointerId);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);
    cleanupListenersRef.current = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
    };

    event.preventDefault();
  };

  useEffect(() => {
    boundsRef.current = bounds;
  }, [bounds]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(FINE_POINTER_QUERY);
    const syncSupportsWindowing = () => {
      setSupportsWindowing(mediaQuery.matches);
    };

    syncSupportsWindowing();
    mediaQuery.addEventListener("change", syncSupportsWindowing);

    return () => {
      mediaQuery.removeEventListener("change", syncSupportsWindowing);
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      resetWindowState();
      setCollapsed(true);
      setActiveTab(DEFAULT_TAB);
      return;
    }

    resetWindowState();
    setCollapsed(true);
    setActiveTab(DEFAULT_TAB);
  }, [resetWindowState, visible]);

  useEffect(() => {
    if (supportsWindowing) {
      return;
    }

    resetWindowState();
  }, [resetWindowState, supportsWindowing]);

  useEffect(() => {
    if (!supportsWindowing) {
      return;
    }

    const handleResize = () => {
      if (!boundsRef.current) {
        return;
      }

      scheduleBounds(
        clampBounds(
          boundsRef.current,
          getViewport(),
          DEBUG_PANEL_WINDOW_GUTTER,
          {
            minHeight: DEBUG_PANEL_MIN_HEIGHT,
            minWidth: DEBUG_PANEL_MIN_WIDTH,
          },
        ),
      );
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [scheduleBounds, supportsWindowing]);

  useEffect(() => {
    return () => {
      cancelScheduledBounds();
      stopInteraction();
    };
  }, [cancelScheduledBounds, stopInteraction]);

  const activeBookmarksBadge =
    bookmarksSource === BOOKMARKS_LIVE_SOURCE
      ? "live:x-api"
      : mockMode
        ? `mock:${mockMode}`
        : null;

  if (!visible) return null;

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        className={cn(
          "fixed bottom-[5vh] left-1/2 z-[9999] flex -translate-x-1/2 items-center gap-2 rounded-full border border-amber-500/50 bg-background/95 px-3 py-2 text-xs font-medium text-amber-500 shadow-2xl backdrop-blur-sm transition-colors hover:bg-amber-500/10",
          "max-w-[calc(100vw-1rem)]",
        )}
      >
        <Bug className="size-3.5" />
        <span className="uppercase tracking-[0.18em]">Debug</span>
        {activeBookmarksBadge && (
          <Badge
            variant="outline"
            className="border-amber-500/40 text-[10px] text-amber-500"
          >
            {activeBookmarksBadge}
          </Badge>
        )}
      </button>
    );
  }

  return (
    <div
      ref={panelRef}
      style={
        bounds
          ? {
              height: bounds.height,
              left: bounds.x,
              top: bounds.y,
              width: bounds.width,
            }
          : undefined
      }
      className={cn(
        "fixed z-[9999] flex flex-col overflow-hidden rounded-2xl border border-amber-500/40 bg-background/95 shadow-2xl backdrop-blur-sm overscroll-contain",
        bounds
          ? "left-0 top-0 max-h-none translate-x-0"
          : "bottom-[5vh] left-1/2 w-[calc(100vw-1rem)] max-h-[72vh] max-w-5xl -translate-x-1/2",
      )}
    >
      {supportsWindowing &&
        RESIZE_HANDLES.map(({ className, cursor, handle }) => (
          <div
            key={handle}
            aria-hidden="true"
            className={cn(className, "touch-none")}
            onPointerDown={(event) => {
              event.stopPropagation();
              startWindowInteraction(event, "resize", handle);
            }}
            style={{ cursor }}
          />
        ))}

      <div
        className={cn(
          "flex items-center justify-between gap-3 border-b border-amber-500/25 px-3 py-2.5 sm:px-4",
          supportsWindowing && "cursor-move select-none touch-none",
        )}
        onPointerDown={
          supportsWindowing
            ? (event) => startWindowInteraction(event, "drag")
            : undefined
        }
      >
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
        <div className="flex items-center gap-1">
          <button
            type="button"
            data-debug-panel-action
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => {
              resetWindowState();
              setCollapsed(true);
            }}
            className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
            title="Collapse"
          >
            <Minus className="size-3.5" />
          </button>
          <button
            type="button"
            data-debug-panel-action
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => {
              resetWindowState();
              clearDebugQueryState();
            }}
            className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
            title="Close"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="min-h-0 flex-1 gap-0 overflow-hidden"
      >
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

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4 sm:py-4">
          {DEBUG_PANEL_TABS.map(({ id, Component }) => (
            <TabsContent key={id} value={id} className="mt-0 min-h-0">
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
