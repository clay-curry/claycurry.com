import { Context, Effect, Layer, Ref } from "effect";
import { makeTracerLayer } from "@/lib/tracing/tracer";
import type { Span } from "@/lib/tracing/types";

// ============================================================
// Types
// ============================================================

export interface DebugLogEntry {
  level: "info" | "warn" | "error";
  msg: string;
  ts: number;
  attrs?: Record<string, unknown>;
}

export interface DebugSpanEntry {
  name: string;
  durationMs: number | null;
  status: "ok" | "error";
  attrs?: Record<string, string | number | boolean>;
}

export interface DebugPayload {
  route: string;
  durationMs: number;
  logs: DebugLogEntry[];
  spans: DebugSpanEntry[];
}

// ============================================================
// Service Interface
// ============================================================

export interface DebugLogService {
  readonly log: (
    level: DebugLogEntry["level"],
    msg: string,
    attrs?: Record<string, unknown>,
  ) => Effect.Effect<void>;
  readonly addSpan: (span: DebugSpanEntry) => Effect.Effect<void>;
  readonly collect: () => Effect.Effect<{
    logs: DebugLogEntry[];
    spans: DebugSpanEntry[];
  }>;
}

// ============================================================
// Tag
// ============================================================

export class DebugLog extends Context.Tag("DebugLog")<
  DebugLog,
  DebugLogService
>() {}

// ============================================================
// Layers
// ============================================================

export const DebugLogLive: Layer.Layer<DebugLog> = Layer.effect(
  DebugLog,
  Effect.gen(function* () {
    const logsRef = yield* Ref.make<DebugLogEntry[]>([]);
    const spansRef = yield* Ref.make<DebugSpanEntry[]>([]);

    return {
      log: (level, msg, attrs) =>
        Ref.update(logsRef, (logs) => [
          ...logs,
          { level, msg, ts: Date.now(), ...(attrs ? { attrs } : {}) },
        ]),
      addSpan: (span) => Ref.update(spansRef, (spans) => [...spans, span]),
      collect: () =>
        Effect.all({
          logs: Ref.get(logsRef),
          spans: Ref.get(spansRef),
        }),
    };
  }),
);

export const DebugLogNoop: Layer.Layer<DebugLog> = Layer.succeed(DebugLog, {
  log: () => Effect.void,
  addSpan: () => Effect.void,
  collect: () => Effect.succeed({ logs: [], spans: [] }),
});

// ============================================================
// Tracer Integration
// ============================================================

export function makeDebugTracerLayer(traceId: string) {
  return Layer.unwrapEffect(
    Effect.gen(function* () {
      const debug = yield* DebugLog;
      return makeTracerLayer(traceId, (span: Span) => {
        Effect.runFork(
          debug.addSpan({
            name: span.name,
            durationMs: span.durationMs,
            status: span.status,
            attrs: span.attributes,
          }),
        );
      });
    }),
  );
}

// ============================================================
// Convenience Helpers
// ============================================================

export const debugLog = (msg: string, attrs?: Record<string, unknown>) =>
  Effect.flatMap(DebugLog, (d) => d.log("info", msg, attrs));

export const debugWarn = (msg: string, attrs?: Record<string, unknown>) =>
  Effect.flatMap(DebugLog, (d) => d.log("warn", msg, attrs));

export const debugError = (msg: string, attrs?: Record<string, unknown>) =>
  Effect.flatMap(DebugLog, (d) => d.log("error", msg, attrs));
