/**
 * @module components/debug/TracePanel
 *
 * Client-side debug overlay for inspecting API trace data.
 * Lazy-loaded and rendered only when the `debug` cookie is present.
 *
 * Activation: visit any page with `?debug=1` to set the debug cookie.
 * Deactivation: visit with `?debug=0` to clear it.
 *
 * The panel intercepts fetch responses to `/api/*` and displays the
 * `__trace` span trees from responses. Rendered as a collapsible
 * floating panel in the bottom-right corner.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import type { TraceLog } from "@/lib/services/Tracing";

interface TraceEntry {
  url: string;
  method: string;
  status: number;
  trace: TraceLog;
  timestamp: number;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

export function TracePanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [entries, setEntries] = useState<TraceEntry[]>([]);
  const [isDebug, setIsDebug] = useState(false);

  // Check debug cookie and URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("debug") === "1") {
      document.cookie = "debug=1; path=/; max-age=86400";
      setIsDebug(true);
    } else if (params.get("debug") === "0") {
      document.cookie = "debug=; path=/; max-age=0";
      setIsDebug(false);
      return;
    } else {
      setIsDebug(getCookie("debug") === "1");
    }
  }, []);

  // Intercept fetch to capture traces
  useEffect(() => {
    if (!isDebug) return;

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      const url =
        typeof args[0] === "string"
          ? args[0]
          : args[0] instanceof Request
            ? args[0].url
            : String(args[0]);

      // Only intercept /api/* calls
      if (url.includes("/api/") && response.ok) {
        try {
          const cloned = response.clone();
          const body = await cloned.json();
          if (body?.__trace) {
            setEntries((prev) => [
              {
                url: url.replace(window.location.origin, ""),
                method:
                  (typeof args[1] === "object" && args[1]?.method) || "GET",
                status: response.status,
                trace: body.__trace,
                timestamp: Date.now(),
              },
              ...prev.slice(0, 49), // Keep last 50 entries
            ]);
          }
        } catch {
          // Not JSON or no __trace — ignore
        }
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [isDebug]);

  const clearEntries = useCallback(() => setEntries([]), []);

  if (!isDebug) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] font-mono text-xs">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="mb-1 px-3 py-1.5 bg-zinc-900 text-emerald-400 border border-emerald-500/50 rounded-md hover:bg-zinc-800 transition-colors shadow-lg"
      >
        {isOpen ? "Hide" : "Trace"} ({entries.length})
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="w-96 max-h-[60vh] bg-zinc-900/95 backdrop-blur border border-zinc-700 rounded-lg shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-700">
            <span className="text-emerald-400 font-semibold">API Traces</span>
            <button
              type="button"
              onClick={clearEntries}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(60vh-3rem)]">
            {entries.length === 0 ? (
              <div className="p-4 text-zinc-500 text-center">
                No traces yet. Make API calls to see spans.
              </div>
            ) : (
              entries.map((entry) => (
                <TraceEntryRow key={entry.timestamp} entry={entry} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TraceEntryRow({ entry }: { entry: TraceEntry }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-zinc-800 last:border-0">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2 text-left hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-zinc-300 truncate">
            <span className="text-yellow-400 mr-1">{entry.method}</span>
            {entry.url}
          </span>
          <span className="text-zinc-500 ml-2 shrink-0">
            {entry.trace.totalMs.toFixed(1)}ms
          </span>
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-2">
          <div className="text-zinc-500 mb-1">
            Trace: {entry.trace.traceId.slice(0, 8)}...
          </div>
          {entry.trace.spans.map((span, i) => (
            <div
              key={`${span.name}-${i}`}
              className="flex items-center gap-2 py-0.5"
            >
              <span
                className={
                  span.status === "ok" ? "text-emerald-400" : "text-red-400"
                }
              >
                {span.status === "ok" ? "\u2713" : "\u2717"}
              </span>
              <span className="text-zinc-300 flex-1 truncate">{span.name}</span>
              <span className="text-zinc-500">
                {span.durationMs.toFixed(1)}ms
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
