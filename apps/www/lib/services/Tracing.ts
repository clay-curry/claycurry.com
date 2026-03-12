/**
 * @module services/Tracing
 *
 * Request-scoped tracing service. Each API request gets a trace ID (from the
 * `trace_id` cookie injected by middleware) and accumulates spans into a
 * `Ref<Array<Span>>`. When debug mode is active, the span log is serialized
 * into the response `__trace` field.
 *
 * Key abstractions:
 * - `TracingService` — Effect Context Tag exposing `span()` and `getTrace()`
 * - `Span` — a single timed operation with name, duration, and status
 * - `TraceLog` — the full trace for a request (traceId + spans + totalMs)
 *
 * The `span(name, effect)` combinator wraps any Effect, recording its
 * timing and outcome. It is transparent to the wrapped effect — errors
 * propagate normally after being recorded.
 *
 * @example
 * ```ts
 * const program = Effect.gen(function* () {
 *   const tracing = yield* TracingService
 *   const count = yield* tracing.span("redis.incr", redis.incr(key))
 *   return count
 * })
 * ```
 */
import { Context, Effect, Layer, Ref } from "effect";

export interface Span {
  readonly name: string;
  readonly startMs: number;
  readonly durationMs: number;
  readonly status: "ok" | "error";
  readonly error?: string;
}

export interface TraceLog {
  readonly traceId: string;
  readonly spans: ReadonlyArray<Span>;
  readonly totalMs: number;
}

export interface TracingServiceInterface {
  /** Wrap an Effect, recording its execution as a named span */
  readonly span: <A, E, R>(
    name: string,
    effect: Effect.Effect<A, E, R>,
  ) => Effect.Effect<A, E, R>;

  /** Retrieve the accumulated trace log for the current request */
  readonly getTrace: () => Effect.Effect<TraceLog>;
}

export class TracingService extends Context.Tag("TracingService")<
  TracingService,
  TracingServiceInterface
>() {}

/**
 * Create a request-scoped TracingService instance.
 * Called once per request in the route handler bridge.
 */
export function makeRequestTracing(
  traceId: string,
): Effect.Effect<TracingServiceInterface> {
  return Effect.gen(function* () {
    const spans = yield* Ref.make<Span[]>([]);
    const startTime = Date.now();

    return {
      span: <A, E, R>(name: string, effect: Effect.Effect<A, E, R>) =>
        Effect.gen(function* () {
          const spanStart = Date.now();
          const result = yield* Effect.either(effect);

          if (result._tag === "Right") {
            yield* Ref.update(spans, (s) => [
              ...s,
              {
                name,
                startMs: spanStart - startTime,
                durationMs: Date.now() - spanStart,
                status: "ok" as const,
              },
            ]);
            return result.right;
          }

          yield* Ref.update(spans, (s) => [
            ...s,
            {
              name,
              startMs: spanStart - startTime,
              durationMs: Date.now() - spanStart,
              status: "error" as const,
              error: String(result.left),
            },
          ]);
          return yield* Effect.fail(result.left);
        }),

      getTrace: () =>
        Effect.gen(function* () {
          const recorded = yield* Ref.get(spans);
          return {
            traceId,
            spans: recorded,
            totalMs: Date.now() - startTime,
          };
        }),
    } satisfies TracingServiceInterface;
  });
}

/**
 * Test Layer providing a no-op tracing service.
 * Spans are still recorded for assertion but don't affect behavior.
 */
export const TracingTest = Layer.effect(
  TracingService,
  makeRequestTracing("test-trace-id"),
);
