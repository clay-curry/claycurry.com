"use client";

import {
  Activity,
  AlertTriangle,
  LoaderCircle,
  RefreshCcw,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/lib/components/ui/badge";
import { Button } from "@/lib/components/ui/button";
import type { SpanNode, TraceMeta } from "@/lib/tracing/types";
import { cn } from "@/lib/utils";
import type { DebugPanelTabProps } from "../types";

const TRACE_HEADER = "x-trace-id";

interface TraceTreeData {
  traceId: string;
  meta: TraceMeta;
  roots: SpanNode[];
}

function formatDuration(ms: number | null): string {
  if (ms === null) return "—";
  if (ms < 1) return "<1ms";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
  });
}

function statusColor(status: "ok" | "error") {
  return status === "ok"
    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
    : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-200";
}

function SpanRow({
  node,
  depth,
  traceStart,
  traceDuration,
}: {
  node: SpanNode;
  depth: number;
  traceStart: number;
  traceDuration: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const { span } = node;
  const hasChildren = node.children.length > 0;
  const hasAttributes = Object.keys(span.attributes).length > 0;
  const hasEvents = span.events.length > 0;
  const hasDetails = hasAttributes || hasEvents;

  // Waterfall bar position
  const spanStart = Date.parse(span.startTime);
  const spanDuration = span.durationMs ?? 0;
  const offsetPct =
    traceDuration > 0 ? ((spanStart - traceStart) / traceDuration) * 100 : 0;
  const widthPct =
    traceDuration > 0
      ? Math.max((spanDuration / traceDuration) * 100, 0.5)
      : 100;

  return (
    <>
      <button
        type="button"
        onClick={() => hasDetails && setExpanded(!expanded)}
        className={cn("group w-full text-left", hasDetails && "cursor-pointer")}
      >
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/70 px-2 py-1.5 text-xs transition-colors hover:bg-muted/40">
          {/* Indent + name */}
          <div
            className="flex shrink-0 items-center gap-1 truncate font-medium text-foreground"
            style={{ paddingLeft: `${depth * 16}px`, maxWidth: "45%" }}
          >
            {hasChildren && (
              <span className="text-muted-foreground text-[10px]">
                {hasDetails ? "▸" : "·"}
              </span>
            )}
            <span className="truncate">{span.name}</span>
          </div>

          {/* Waterfall bar */}
          <div className="relative h-4 min-w-0 flex-1">
            <div
              className={cn(
                "absolute top-0.5 h-3 rounded-sm",
                span.status === "ok" ? "bg-emerald-500/40" : "bg-red-500/40",
              )}
              style={{
                left: `${Math.min(offsetPct, 99)}%`,
                width: `${Math.min(widthPct, 100 - offsetPct)}%`,
              }}
            />
          </div>

          {/* Duration + status */}
          <div className="flex shrink-0 items-center gap-1.5">
            <Badge
              variant="outline"
              className={cn("text-[10px] px-1 py-0", statusColor(span.status))}
            >
              {span.status}
            </Badge>
            <span className="tabular-nums text-muted-foreground w-14 text-right">
              {formatDuration(span.durationMs)}
            </span>
          </div>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && hasDetails && (
        <div
          className="mb-1 ml-2 space-y-1 rounded-lg border border-border/40 bg-muted/20 px-3 py-2 text-[11px]"
          style={{ marginLeft: `${depth * 16 + 8}px` }}
        >
          {hasAttributes && (
            <div className="space-y-0.5">
              <p className="font-medium uppercase tracking-wider text-muted-foreground">
                Attributes
              </p>
              {Object.entries(span.attributes).map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="shrink-0 text-muted-foreground">{k}:</span>
                  <span className="text-foreground break-all">{String(v)}</span>
                </div>
              ))}
            </div>
          )}
          {hasEvents && (
            <div className="space-y-0.5">
              <p className="font-medium uppercase tracking-wider text-muted-foreground">
                Events
              </p>
              {span.events.map((evt, i) => (
                <div key={`${evt.name}-${i}`} className="flex gap-2">
                  <span className="shrink-0 text-muted-foreground">
                    {formatTime(evt.timestamp)}
                  </span>
                  <span className="text-foreground">{evt.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Children */}
      {hasChildren &&
        node.children.map((child) => (
          <SpanRow
            key={child.span.spanId}
            node={child}
            depth={depth + 1}
            traceStart={traceStart}
            traceDuration={traceDuration}
          />
        ))}
    </>
  );
}

function TraceTree({ data }: { data: TraceTreeData }) {
  const allSpans = flattenNodes(data.roots);
  const traceStart =
    allSpans.length > 0
      ? Math.min(...allSpans.map((s) => Date.parse(s.startTime)))
      : 0;
  const traceEnd =
    allSpans.length > 0
      ? Math.max(
          ...allSpans.map(
            (s) => Date.parse(s.endTime ?? s.startTime) + (s.durationMs ?? 0),
          ),
        )
      : 0;
  const traceDuration = traceEnd - traceStart;
  const totalDuration = allSpans.reduce(
    (sum, s) => sum + (s.durationMs ?? 0),
    0,
  );

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <SummaryCard label="Spans" value={String(data.meta.spanCount)} />
        <SummaryCard label="Requests" value={String(data.meta.requestCount)} />
        <SummaryCard label="Total" value={formatDuration(totalDuration)} />
        <SummaryCard label="Wall" value={formatDuration(traceDuration)} />
      </div>

      {/* Waterfall */}
      <div className="space-y-0.5">
        {data.roots.map((root) => (
          <SpanRow
            key={root.span.spanId}
            node={root}
            depth={0}
            traceStart={traceStart}
            traceDuration={traceDuration}
          />
        ))}
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/70 px-2.5 py-2 text-center">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}

function flattenNodes(roots: SpanNode[]): SpanNode["span"][] {
  const result: SpanNode["span"][] = [];
  function walk(node: SpanNode) {
    result.push(node.span);
    for (const child of node.children) walk(child);
  }
  for (const root of roots) walk(root);
  return result;
}

export function TraceTab(_props: DebugPanelTabProps) {
  const [traceId, setTraceId] = useState<string | null>(null);
  const [data, setData] = useState<TraceTreeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const discoveredRef = useRef(false);

  // Discover the current trace ID by making a lightweight API call
  const discoverTraceId = useCallback(async () => {
    try {
      const res = await fetch("/api/x/bookmarks?debug=1", { method: "GET" });
      const id = res.headers.get(TRACE_HEADER);
      if (id) {
        console.info("[trace]", id);
        setTraceId(id);
        return id;
      }
      setError("No trace ID in response headers. Is the proxy running?");
      return null;
    } catch {
      setError("Failed to reach API — is the dev server running?");
      return null;
    }
  }, []);

  const fetchTrace = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/trace/${id}?tree=true`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error ?? `HTTP ${res.status}`);
        setData(null);
        return;
      }
      setData(await res.json());
    } catch {
      setError("Failed to fetch trace data.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-discover on mount
  useEffect(() => {
    if (discoveredRef.current) return;
    discoveredRef.current = true;
    discoverTraceId().then((id) => {
      if (id) fetchTrace(id);
    });
  }, [discoverTraceId, fetchTrace]);

  const handleRefresh = useCallback(async () => {
    const id = await discoverTraceId();
    if (id) await fetchTrace(id);
  }, [discoverTraceId, fetchTrace]);

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-amber-500" />
          <span className="text-sm font-semibold text-foreground">
            Request Trace
          </span>
          {traceId && (
            <Badge variant="outline" className="font-mono text-[10px]">
              {traceId.slice(0, 8)}…
            </Badge>
          )}
        </div>
        <Button
          onClick={handleRefresh}
          size="sm"
          variant="outline"
          disabled={loading}
        >
          {loading ? (
            <LoaderCircle className="size-3.5 animate-spin" />
          ) : (
            <RefreshCcw className="size-3.5" />
          )}
          Refresh
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-700 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && !data && (
        <div className="flex min-h-32 items-center justify-center text-sm text-muted-foreground">
          <LoaderCircle className="mr-2 size-4 animate-spin" />
          Loading trace…
        </div>
      )}

      {/* Trace tree */}
      {data && <TraceTree data={data} />}

      {/* Empty state */}
      {!loading && !error && !data && (
        <div className="flex min-h-32 items-center justify-center text-sm text-muted-foreground">
          No trace data available. Click Refresh after making an API request.
        </div>
      )}
    </div>
  );
}
