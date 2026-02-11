"use client";

import { atom, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useCallback, useEffect, useRef } from "react";

export const clickCountsAtom = atom<Record<string, number>>({});
export const clickCountsEnabledAtom = atomWithStorage<boolean>(
  "portfolio:click-counts",
  false,
);

const FLUSH_INTERVAL = 2000;

export function useClickCountEngine() {
  const [counts, setCounts] = useAtom(clickCountsAtom);
  const batchRef = useRef<string[]>([]);

  const flush = useCallback(async () => {
    const batch = batchRef.current.splice(0);
    if (batch.length === 0) return;

    try {
      const res = await fetch("/api/clicks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: batch }),
      });
      if (res.ok) {
        const { counts: serverCounts } = await res.json();
        setCounts((prev) => ({ ...prev, ...serverCounts }));
      }
    } catch {
      // Fire-and-forget — failed flushes retry on next interval
      batchRef.current.unshift(...batch);
    }
  }, [setCounts]);

  // Seed counts on mount
  useEffect(() => {
    let cancelled = false;
    fetch("/api/clicks")
      .then((res) => res.json())
      .then(({ counts: serverCounts }) => {
        if (!cancelled) {
          setCounts((prev) => ({ ...prev, ...serverCounts }));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [setCounts]);

  // Global click listener
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = (e.target as Element)?.closest?.("[data-click-id]");
      if (!target) return;
      const id = target.getAttribute("data-click-id");
      if (!id) return;

      batchRef.current.push(id);
      setCounts((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
    };

    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [setCounts]);

  // Flush interval
  useEffect(() => {
    const id = setInterval(flush, FLUSH_INTERVAL);
    return () => clearInterval(id);
  }, [flush]);

  // Flush on tab hide / page unload
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        const batch = batchRef.current.splice(0);
        if (batch.length > 0) {
          navigator.sendBeacon(
            "/api/clicks",
            new Blob([JSON.stringify({ ids: batch })], {
              type: "application/json",
            }),
          );
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return counts;
}
