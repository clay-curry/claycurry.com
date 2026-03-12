/**
 * @module api/_shared/handler
 *
 * Bridge between Next.js route handlers and Effect programs.
 *
 * `runRouteHandler(req, program)` does the following:
 * 1. Reads the `x-trace-id` and `x-debug-mode` headers (set by middleware)
 * 2. Creates a request-scoped `TracingService` with the trace ID
 * 3. Runs the Effect program with the production runtime + TracingService
 * 4. On success, returns the NextResponse from the program
 * 5. On failure, maps the tagged error to the correct HTTP status
 * 6. If debug mode is active, appends `__trace` to the response body
 * 7. Emits structured JSON logs for request lifecycle (start, complete, error)
 *
 * Route handlers provide an Effect that returns a NextResponse directly,
 * giving them full control over response headers, cookies, and status codes.
 *
 * @example
 * ```ts
 * export async function GET(req: NextRequest) {
 *   return runRouteHandler(req, Effect.gen(function* () {
 *     const redis = yield* RedisService
 *     const count = yield* redis.get("key")
 *     return NextResponse.json({ count })
 *   }))
 * }
 * ```
 */
import { Effect, Layer, Logger, LogLevel } from "effect";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { AppError } from "@/lib/effect/errors";
import type { AppRequirements } from "@/lib/effect/runtime";
import { appRuntime } from "@/lib/effect/runtime";
import { makeRequestTracing, TracingService } from "@/lib/services/Tracing";
import { errorToStatus, jsonError } from "./response";

type RouteEffect = Effect.Effect<
  NextResponse,
  AppError,
  AppRequirements | TracingService
>;

/**
 * Run an Effect-based route handler with the production runtime.
 * Provides request-scoped TracingService and handles errors uniformly.
 * Emits structured logs for every request lifecycle event.
 */
export async function runRouteHandler(
  req: NextRequest,
  program: RouteEffect,
): Promise<NextResponse> {
  const traceId = req.headers.get("x-trace-id") ?? crypto.randomUUID();
  const debugMode = req.headers.get("x-debug-mode") === "true";
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;
  const startTime = Date.now();

  const tracingLayer = Layer.effect(
    TracingService,
    makeRequestTracing(traceId),
  );

  const fullProgram = Effect.gen(function* () {
    yield* Effect.logInfo("Request started");

    const response = debugMode
      ? yield* Effect.gen(function* () {
          const tracing = yield* TracingService;
          const res = yield* tracing.span("handler", program);
          const trace = yield* tracing.getTrace();

          // Clone response and inject __trace into body
          const body = yield* Effect.promise(() => res.json());
          const enrichedBody = { ...body, __trace: trace };
          const enrichedResponse = NextResponse.json(enrichedBody, {
            status: res.status,
            headers: res.headers,
          });

          // Copy cookies from original response
          for (const cookie of res.cookies.getAll()) {
            enrichedResponse.cookies.set(cookie);
          }

          return enrichedResponse;
        })
      : yield* program;

    yield* Effect.logInfo("Request completed").pipe(
      Effect.annotateLogs("status", response.status),
      Effect.annotateLogs("durationMs", Date.now() - startTime),
    );

    return response;
  });

  const runnable = fullProgram.pipe(
    Effect.catchAll((error: AppError) => {
      const status = errorToStatus(error._tag);

      return Effect.gen(function* () {
        yield* Effect.logError("Request failed").pipe(
          Effect.annotateLogs("errorTag", error._tag),
          Effect.annotateLogs("errorMessage", error.message),
          Effect.annotateLogs("status", status),
          Effect.annotateLogs("durationMs", Date.now() - startTime),
        );

        if (debugMode) {
          const tracing = yield* TracingService;
          const trace = yield* tracing.getTrace();
          return jsonError(error.message, status, trace);
        }
        return jsonError(error.message, status);
      });
    }),
    // Thread request context through all log calls in this pipeline
    Effect.annotateLogs("traceId", traceId),
    Effect.annotateLogs("method", method),
    Effect.annotateLogs("path", path),
    Effect.annotateLogs("debugMode", debugMode),
    Effect.withLogSpan("request"),
    Effect.provide(tracingLayer),
  );

  // In debug mode, lower log level to Debug so Effect.logDebug() calls emit
  const withLogLevel = debugMode
    ? runnable.pipe(Logger.withMinimumLogLevel(LogLevel.Debug))
    : runnable;

  return appRuntime.runPromise(withLogLevel);
}
