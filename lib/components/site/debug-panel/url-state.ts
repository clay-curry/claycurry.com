"use client";

import { useEffect, useState } from "react";
import {
  BOOKMARKS_DEBUG_SOURCE_QUERY_PARAM,
  type BookmarksDebugSource,
} from "@/lib/x/debug";

export const DEBUG_PANEL_STATE_EVENT = "debug-panel-state-change";
export const DEBUG_BOOKMARKS_CONFIG_CHANGE_EVENT =
  "debug-bookmarks-config-change";

export type DebugQueryState = {
  visible: boolean;
  bookmarksSource: BookmarksDebugSource;
  mockMode: string;
};

const DEFAULT_DEBUG_QUERY_STATE: DebugQueryState = {
  visible: false,
  bookmarksSource: "",
  mockMode: "",
};

function getParam(search: string, key: string): string | null {
  return new URLSearchParams(search).get(key);
}

function readDebugQueryState(): DebugQueryState {
  if (typeof window === "undefined") {
    return DEFAULT_DEBUG_QUERY_STATE;
  }

  return {
    visible: getParam(window.location.search, "debug") === "1",
    bookmarksSource:
      (getParam(
        window.location.search,
        BOOKMARKS_DEBUG_SOURCE_QUERY_PARAM,
      ) as BookmarksDebugSource | null) || "",
    mockMode: getParam(window.location.search, "mock") || "",
  };
}

function setParam(url: URL, key: string, value: string | null) {
  if (value) {
    url.searchParams.set(key, value);
    return;
  }

  url.searchParams.delete(key);
}

export function updateDebugQueryState(next: Partial<DebugQueryState>) {
  if (typeof window === "undefined") return;

  const previous = readDebugQueryState();
  const current = { ...previous, ...next };
  const url = new URL(window.location.href);

  setParam(url, "debug", current.visible ? "1" : null);
  setParam(
    url,
    BOOKMARKS_DEBUG_SOURCE_QUERY_PARAM,
    current.bookmarksSource || null,
  );
  setParam(url, "mock", current.mockMode || null);

  window.history.replaceState({}, "", url.toString());
  window.dispatchEvent(new Event(DEBUG_PANEL_STATE_EVENT));

  if (
    previous.mockMode !== current.mockMode ||
    previous.bookmarksSource !== current.bookmarksSource
  ) {
    window.dispatchEvent(new Event(DEBUG_BOOKMARKS_CONFIG_CHANGE_EVENT));
  }
}

export function clearDebugQueryState() {
  updateDebugQueryState({
    visible: false,
    bookmarksSource: "",
    mockMode: "",
  });
}

export function useDebugQueryState() {
  const [state, setState] = useState<DebugQueryState>(
    DEFAULT_DEBUG_QUERY_STATE,
  );

  useEffect(() => {
    const sync = () => setState(readDebugQueryState());

    sync();
    window.addEventListener(DEBUG_PANEL_STATE_EVENT, sync);
    window.addEventListener("popstate", sync);

    return () => {
      window.removeEventListener(DEBUG_PANEL_STATE_EVENT, sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  return state;
}
