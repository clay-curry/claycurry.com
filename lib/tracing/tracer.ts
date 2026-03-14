import { type Exit, Layer, Tracer } from "effect";
import type { Span } from "./types";

/**
 * Effect Tracer implementation that collects completed spans
 * and delegates persistence to a plain callback.
 *
 * Integrates with Effect.withSpan() for automatic span lifecycle management.
 */

/** Callback invoked when a span ends. Must handle its own errors. */
export type OnSpanEnd = (span: Span) => void;

const TRACE_HEADER = "x-trace-id";

/** Read the trace ID injected by middleware from a Request. */
export function traceIdFromRequest(request: Request): string | null {
  return request.headers.get(TRACE_HEADER);
}

/** Generate a 16-char hex span ID. */
function generateSpanId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Convert nanosecond bigint to millisecond number. */
function nanoToMs(nano: bigint): number {
  return Number(nano / BigInt(1_000_000));
}

/**
 * Creates an Effect Tracer that converts Effect spans into our Span type
 * and calls onSpanEnd when each span completes.
 */
function makeAppTracer(traceId: string, onSpanEnd: OnSpanEnd): Tracer.Tracer {
  return Tracer.make({
    span(name, parent, context, _links, startTime, kind) {
      const spanId = generateSpanId();
      const parentSpanId =
        parent._tag === "Some" && parent.value._tag === "Span"
          ? (parent.value.spanId as string)
          : null;

      const attributes = new Map<string, unknown>();
      const events: Array<{
        timestamp: string;
        name: string;
        attributes?: Record<string, string | number | boolean>;
      }> = [];

      let spanStatus: "ok" | "error" = "ok";
      let ended = false;

      return {
        _tag: "Span" as const,
        spanId,
        traceId,
        name,
        sampled: true,
        kind,
        status: {
          _tag: "Started" as const,
          startTime,
        },
        attributes,
        links: [] as ReadonlyArray<Tracer.SpanLink>,
        parent,
        context,
        attribute(key: string, value: unknown) {
          attributes.set(key, value);
        },
        addLinks(_newLinks: ReadonlyArray<Tracer.SpanLink>) {
          // Not used for our tracing purposes
        },
        event(
          eventName: string,
          startTimeNano?: bigint,
          attrs?: Record<string, unknown>,
        ) {
          const timestamp = startTimeNano
            ? new Date(nanoToMs(startTimeNano)).toISOString()
            : new Date().toISOString();
          const filtered: Record<string, string | number | boolean> = {};
          if (attrs) {
            for (const [k, v] of Object.entries(attrs)) {
              if (
                typeof v === "string" ||
                typeof v === "number" ||
                typeof v === "boolean"
              ) {
                filtered[k] = v;
              }
            }
          }
          events.push({
            timestamp,
            name: eventName,
            attributes: Object.keys(filtered).length > 0 ? filtered : undefined,
          });
        },
        end(endTimeNano: bigint, exit: Exit.Exit<unknown, unknown>) {
          if (ended) return;
          ended = true;

          if (exit._tag === "Failure") {
            spanStatus = "error";
          }

          const startMs = nanoToMs(startTime);
          const endMs = nanoToMs(endTimeNano);

          const flatAttrs: Record<string, string | number | boolean> = {};
          for (const [k, v] of attributes) {
            if (
              typeof v === "string" ||
              typeof v === "number" ||
              typeof v === "boolean"
            ) {
              flatAttrs[k] = v;
            }
          }

          const completedSpan: Span = {
            traceId,
            spanId,
            parentSpanId,
            name,
            startTime: new Date(startMs).toISOString(),
            endTime: new Date(endMs).toISOString(),
            durationMs: endMs - startMs,
            status: spanStatus,
            attributes: flatAttrs,
            events,
          };

          // Fire-and-forget: caller handles persistence
          onSpanEnd(completedSpan);
        },
      };
    },
    context(f) {
      return f();
    },
  });
}

/**
 * Create a Layer that installs the app tracer for a specific trace ID.
 * Use this in route handlers:
 *
 * ```ts
 * const TracerLive = makeTracerLayer(traceId, (span) => {
 *   appRuntime.runFork(persistSpan(span));
 * });
 * Effect.provide(program, TracerLive);
 * ```
 */
export function makeTracer(
  traceId: string,
  onSpanEnd: OnSpanEnd,
): Tracer.Tracer {
  return makeAppTracer(traceId, onSpanEnd);
}

export function makeTracerLayer(
  traceId: string,
  onSpanEnd: OnSpanEnd,
): Layer.Layer<never> {
  return Layer.succeed(Tracer.Tracer, makeAppTracer(traceId, onSpanEnd));
}
