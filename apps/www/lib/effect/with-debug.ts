import { Effect } from "effect";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  buildSpanTree,
  makeTracerLayer,
  persistSpan,
  type Span,
  traceIdFromRequest,
} from "@/lib/tracing";
import { appRuntime } from "./runtime";
import {
  DebugLogCollector,
  DebugLogCollectorLive,
  type DebugPayload,
  formatFiberId,
  makeDebugLoggerLayer,
} from "./services/debug-log";
import type { RedisClient } from "./services/redis";

/**
 * Run an Effect program and optionally collect debug info when `?debug=1`.
 *
 * When debug is OFF: runs `appRuntime.runPromise(program)` — zero overhead.
 * When debug is ON: wraps the program with a log collector, tracer, and
 * appends a `__debug` field to the JSON response.
 *
 * Accepts programs requiring RedisClient (provided by appRuntime) or
 * programs with no requirements.
 */
export async function withDebug(
  request: NextRequest | Request,
  program: Effect.Effect<NextResponse, never, RedisClient | never>,
): Promise<NextResponse> {
  const url = new URL(request.url);
  const isDebug = url.searchParams.get("debug") === "1";

  if (!isDebug) {
    return appRuntime.runPromise(program);
  }

  const startTime = performance.now();
  const requestReceivedAt = new Date().toISOString();

  // Collect spans in memory
  const collectedSpans: Span[] = [];

  // Build tracer layer (reusing existing infrastructure)
  const traceId =
    traceIdFromRequest(request) ??
    crypto.randomUUID().replace(/-/g, "").slice(0, 32);

  const TracerLive = makeTracerLayer(traceId, (span) => {
    collectedSpans.push(span);
    // Also persist to Redis for the trace API
    appRuntime.runFork(persistSpan(span));
  });

  // Build the debug-wrapped program:
  // 1. Create the collector
  // 2. Replace the logger with a debug-aware one
  // 3. Install the tracer
  // 4. After execution, drain logs and build the __debug payload
  const debugProgram = Effect.gen(function* () {
    const collector = yield* DebugLogCollector;
    const DebugLoggerLive = makeDebugLoggerLayer(collector);

    const response = yield* program.pipe(
      Effect.provide(DebugLoggerLive),
      Effect.provide(TracerLive),
    );

    const logs = yield* collector.drain();
    const fiberId = yield* Effect.fiberId;
    const durationMs = Math.round(performance.now() - startTime);

    const spanTree = buildSpanTree(collectedSpans);

    const debugPayload: DebugPayload = {
      __debug: {
        durationMs,
        requestReceivedAt,
        logs,
        spans: spanTree,
        fiberId: formatFiberId(fiberId),
      },
    };

    // Append __debug to the JSON response body
    return appendDebugToResponse(response, debugPayload);
  }).pipe(Effect.provide(DebugLogCollectorLive));

  return appRuntime.runPromise(debugProgram);
}

/**
 * Clone a NextResponse and append the __debug field to its JSON body.
 * If the response isn't JSON, add it as an X-Debug header instead.
 */
function appendDebugToResponse(
  response: NextResponse,
  debugPayload: DebugPayload,
): NextResponse {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    // Non-JSON response: encode as header (truncated to 8KB)
    try {
      const encoded = btoa(JSON.stringify(debugPayload.__debug));
      const truncated = encoded.slice(0, 8192);
      response.headers.set("X-Debug", truncated);
    } catch {
      // Silently skip if encoding fails
    }
    return response;
  }

  // For JSON responses, parse and re-create with __debug appended
  // We need to read the body, which consumes the stream, so we build a new response
  return new NextResponse(
    new ReadableStream({
      async start(controller) {
        try {
          const originalBody = await response.text();
          let parsed: Record<string, unknown>;
          try {
            parsed = JSON.parse(originalBody);
          } catch {
            parsed = { _raw: originalBody };
          }
          const merged = { ...parsed, ...debugPayload };
          controller.enqueue(new TextEncoder().encode(JSON.stringify(merged)));
        } catch {
          controller.enqueue(
            new TextEncoder().encode(JSON.stringify(debugPayload)),
          );
        }
        controller.close();
      },
    }),
    {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    },
  );
}
