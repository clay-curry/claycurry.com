"use client";

import { useEffect } from "react";
import { syncTrackingSearch } from "@/lib/tracking-query-store";

let bootstrapRefCount = 0;
let stopTrackingSync: (() => void) | null = null;

function startTrackingSync(): () => void {
  const syncFromLocation = () => {
    syncTrackingSearch(window.location.search);
  };

  const originalPushState = window.history.pushState.bind(window.history);
  const originalReplaceState = window.history.replaceState.bind(window.history);

  window.history.pushState = ((...args) => {
    const result = originalPushState(...args);
    syncFromLocation();
    return result;
  }) as History["pushState"];

  window.history.replaceState = ((...args) => {
    const result = originalReplaceState(...args);
    syncFromLocation();
    return result;
  }) as History["replaceState"];

  window.addEventListener("popstate", syncFromLocation);
  syncFromLocation();

  return () => {
    window.history.pushState = originalPushState;
    window.history.replaceState = originalReplaceState;
    window.removeEventListener("popstate", syncFromLocation);
  };
}

export function TrackingQueryBootstrap() {
  useEffect(() => {
    bootstrapRefCount += 1;

    if (!stopTrackingSync) {
      stopTrackingSync = startTrackingSync();
    }

    return () => {
      bootstrapRefCount -= 1;

      if (bootstrapRefCount === 0 && stopTrackingSync) {
        stopTrackingSync();
        stopTrackingSync = null;
        syncTrackingSearch("");
      }
    };
  }, []);

  return null;
}
