# Phase 1: DebugLog Effect Service

## Goal

Create an Effect `Context.Tag` service that collects structured log entries and
span summaries during a single request's execution. Two layers are provided:
`DebugLogLive` for active collection and `DebugLogNoop` for zero-cost passthrough.

## New File

**`apps/www/lib/debug/service.ts`**

## Types

### `DebugLogEntry`

A single log message captured during request execution.

```typescript
interface DebugLogEntry {
  /** Severity level */
  level: "info" | "warn" | "error";
  /** Human-readable message */
  msg: string;
  /** Unix timestamp in milliseconds */
  ts: number;
  /** Optional structured attributes */
  attrs?: Record<string, unknown>;
}
```

### `DebugSpanEntry`

A summarized span (derived from the Effect tracer's completed spans).

```typescript
interface DebugSpanEntry {
  /** Span name (e.g., "redis.incr", "getViewCount") */
  name: string;
  /** Duration in milliseconds, null if span didn't complete */
  durationMs: number | null;
  /** Span exit status */
  status: "ok" | "error";
  /** Flattened span attributes (only primitive values) */
  attrs?: Record<string, string | number | boolean>;
}
```

### `DebugPayload`

The complete debug output attached to a response as `__debug`.

```typescript
interface DebugPayload {
  /** Route label, e.g. "POST /api/views" */
  route: string;
  /** Total request duration in milliseconds */
  durationMs: number;
  /** Log entries collected during execution */
  logs: DebugLogEntry[];
  /** Span summaries collected during execution */
  spans: DebugSpanEntry[];
}
```

## Service Interface

```typescript
interface DebugLogService {
  /** Append a log entry */
  readonly log: (
    level: DebugLogEntry["level"],
    msg: string,
    attrs?: Record<string, unknown>,
  ) => Effect.Effect<void>;

  /** Append a span summary (called by the tracer onSpanEnd callback) */
  readonly addSpan: (span: DebugSpanEntry) => Effect.Effect<void>;

  /** Collect all accumulated logs and spans */
  readonly collect: () => Effect.Effect<{
    logs: DebugLogEntry[];
    spans: DebugSpanEntry[];
  }>;
}
```

## Tag

```typescript
class DebugLog extends Context.Tag("DebugLog")<DebugLog, DebugLogService>() {}
```

## Layers

### `DebugLogLive`

Creates fresh `Ref` instances per-request to collect logs and spans. This layer
is only installed when `X-Debug: 1` is present, so the `Ref` allocation cost is
only paid when debugging.

```typescript
const DebugLogLive: Layer.Layer<DebugLog> = Layer.effect(
  DebugLog,
  Effect.gen(function* () {
    const logsRef = yield* Ref.make<DebugLogEntry[]>([]);
    const spansRef = yield* Ref.make<DebugSpanEntry[]>([]);

    return {
      log: (level, msg, attrs) =>
        Ref.update(logsRef, (logs) => [
          ...logs,
          { level, msg, ts: Date.now(), attrs },
        ]),
      addSpan: (span) =>
        Ref.update(spansRef, (spans) => [...spans, span]),
      collect: () =>
        Effect.all({
          logs: Ref.get(logsRef),
          spans: Ref.get(spansRef),
        }),
    };
  }),
);
```

### `DebugLogNoop`

All methods are no-ops. `collect()` returns empty arrays. This layer has zero
allocation cost and is used when debug mode is off.

```typescript
const DebugLogNoop: Layer.Layer<DebugLog> = Layer.succeed(DebugLog, {
  log: () => Effect.void,
  addSpan: () => Effect.void,
  collect: () => Effect.succeed({ logs: [], spans: [] }),
});
```

## Tracer Integration

When debug mode is active, a debug-specific tracer layer is created using the
existing `makeTracerLayer` from `lib/tracing/tracer.ts`. The `onSpanEnd` callback
converts the full `Span` object into a `DebugSpanEntry` and calls
`DebugLog.addSpan()`.

```typescript
function makeDebugTracerLayer(traceId: string): Layer.Layer<never, never, DebugLog> {
  return Layer.unwrapEffect(
    Effect.gen(function* () {
      const debug = yield* DebugLog;
      return makeTracerLayer(traceId, (span) => {
        // Fire-and-forget: convert Span → DebugSpanEntry and collect
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
```

This means:
- When debug is **on**: spans are collected into the DebugLog and returned in
  `__debug.spans`
- When debug is **off**: no tracer layer is installed (or the existing
  Redis-persisting tracer is used as before), so no debug spans are collected

## Convenience Helpers

### `debugLog`

Shorthand for logging within Effect pipelines:

```typescript
const debugLog = (msg: string, attrs?: Record<string, unknown>) =>
  Effect.flatMap(DebugLog, (d) => d.log("info", msg, attrs));

const debugWarn = (msg: string, attrs?: Record<string, unknown>) =>
  Effect.flatMap(DebugLog, (d) => d.log("warn", msg, attrs));

const debugError = (msg: string, attrs?: Record<string, unknown>) =>
  Effect.flatMap(DebugLog, (d) => d.log("error", msg, attrs));
```

These are safe to call regardless of which layer is provided — with
`DebugLogNoop` they become no-ops.

## Exports

```typescript
export {
  DebugLog,
  DebugLogLive,
  DebugLogNoop,
  debugLog,
  debugWarn,
  debugError,
  makeDebugTracerLayer,
};
export type { DebugLogEntry, DebugSpanEntry, DebugPayload, DebugLogService };
```

## Dependencies

- `effect` (already installed: `^3.19.19`)
- `lib/tracing/tracer.ts` — `makeTracerLayer`
- `lib/tracing/types.ts` — `Span`

No new packages required.
