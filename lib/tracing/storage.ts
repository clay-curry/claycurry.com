import { Effect } from "effect";
import { keyPrefix, RedisClient } from "@/lib/effect/services/redis";
import type { Span, TraceMeta } from "./types";
import { MAX_SPANS_PER_TRACE, TRACE_TTL_SECONDS } from "./types";

function spanListKey(traceId: string): string {
  return `${keyPrefix()}trace:${traceId}:spans`;
}

function metaKey(traceId: string): string {
  return `${keyPrefix()}trace:${traceId}:meta`;
}

/**
 * Persist a completed span to Redis.
 * Called by the tracer when a span ends (fire-and-forget).
 *
 * - Enforces span budget (MAX_SPANS_PER_TRACE)
 * - Updates trace metadata (spanCount, requestCount, firstSeen)
 * - Sets sliding-window TTL on both keys
 */
export const persistSpan = (span: Span) =>
  Effect.gen(function* () {
    const redis = yield* RedisClient;
    const listKey = spanListKey(span.traceId);
    const mKey = metaKey(span.traceId);

    // Enforce span budget
    const currentLength = yield* redis.lLen(listKey);
    if (currentLength >= MAX_SPANS_PER_TRACE) {
      return;
    }

    const serialized = JSON.stringify(span);

    // Append span to list
    yield* redis.rPush(listKey, serialized);

    // Update metadata
    yield* redis.hIncrBy(mKey, "spanCount", 1);

    if (!span.parentSpanId) {
      // Root span: increment request count + set firstSeen if new
      yield* redis.hIncrBy(mKey, "requestCount", 1);
      const existing = yield* redis.hGetAll(mKey);
      if (!existing.firstSeen) {
        yield* redis.hSet(mKey, "firstSeen", span.startTime);
      }
    }

    // Refresh TTL (sliding window)
    yield* redis.expire(listKey, TRACE_TTL_SECONDS);
    yield* redis.expire(mKey, TRACE_TTL_SECONDS);
  }).pipe(
    Effect.catchAll((err) => {
      console.error("Span persistence error:", err);
      return Effect.void;
    }),
  );

/**
 * Retrieve all spans for a trace from Redis.
 * Returns null if the trace doesn't exist.
 */
export const getTrace = (traceId: string) =>
  Effect.gen(function* () {
    const redis = yield* RedisClient;
    const listKey = spanListKey(traceId);
    const mKey = metaKey(traceId);

    const [rawSpans, rawMeta] = yield* Effect.all([
      redis.lRange(listKey, 0, -1),
      redis.hGetAll(mKey),
    ]);

    if (rawSpans.length === 0) {
      return null;
    }

    const spans: Span[] = rawSpans
      .map((raw) => {
        try {
          return JSON.parse(raw) as Span;
        } catch {
          return null;
        }
      })
      .filter((s): s is Span => s !== null)
      .sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime));

    const meta: TraceMeta = {
      firstSeen: rawMeta.firstSeen ?? spans[0]?.startTime ?? "",
      requestCount: Number(rawMeta.requestCount ?? "0"),
      spanCount: Number(rawMeta.spanCount ?? "0"),
    };

    return { traceId, meta, spans };
  });
