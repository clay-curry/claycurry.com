/** A single unit of work within a trace. */
export interface Span {
  traceId: string;
  spanId: string;
  parentSpanId: string | null;
  name: string;
  startTime: string;
  endTime: string | null;
  durationMs: number | null;
  status: "ok" | "error";
  attributes: Record<string, string | number | boolean>;
  events: SpanEvent[];
}

/** Point-in-time annotation within a span. */
export interface SpanEvent {
  timestamp: string;
  name: string;
  attributes?: Record<string, string | number | boolean>;
}

/** Metadata about a trace stored alongside spans. */
export interface TraceMeta {
  firstSeen: string;
  requestCount: number;
  spanCount: number;
}

/** Full trace response returned by the retrieval API. */
export interface TraceResponse {
  traceId: string;
  meta: TraceMeta;
  spans: Span[];
}

/** Tree-structured trace response. */
export interface SpanNode {
  span: Span;
  children: SpanNode[];
}

export interface TraceTreeResponse {
  traceId: string;
  meta: TraceMeta;
  roots: SpanNode[];
}

/** Maximum spans per trace before dropping. */
export const MAX_SPANS_PER_TRACE = 50;

/** Redis TTL for trace data in seconds. */
export const TRACE_TTL_SECONDS = 3600;
