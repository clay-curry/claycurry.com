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
import { Effect, Layer } from "effect";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { AppError } from "@/lib/effect/errors";
import { appRuntime } from "@/lib/effect/runtime";
import type { RedisService } from "@/lib/services/Redis";
import { makeRequestTracing, TracingService } from "@/lib/services/Tracing";
import { errorToStatus, jsonError } from "./response";

type RouteEffect = Effect.Effect<
  NextResponse,
  AppError,
  RedisService | TracingService
>;

/**
 * Run an Effect-based route handler with the production runtime.
 * Provides request-scoped TracingService and handles errors uniformly.
 */
export async function runRouteHandler(
  req: NextRequest,
  program: RouteEffect,
): Promise<NextResponse> {
  const traceId = req.headers.get("x-trace-id") ?? crypto.randomUUID();
  const debugMode = req.headers.get("x-debug-mode") === "true";

  const tracingLayer = Layer.effect(
    TracingService,
    makeRequestTracing(traceId),
  );

  const fullProgram = debugMode
    ? Effect.gen(function* () {
        const tracing = yield* TracingService;
        const response = yield* tracing.span("handler", program);
        const trace = yield* tracing.getTrace();

        // Clone response and inject __trace into body
        const body = yield* Effect.promise(() => response.json());
        const enrichedBody = { ...body, __trace: trace };
        const enrichedResponse = NextResponse.json(enrichedBody, {
          status: response.status,
          headers: response.headers,
        });

        // Copy cookies from original response
        for (const cookie of response.cookies.getAll()) {
          enrichedResponse.cookies.set(cookie);
        }

        return enrichedResponse;
      })
    : program;

  const runnable = fullProgram.pipe(
    Effect.catchAll((error: AppError) => {
      const status = errorToStatus(error._tag);
      if (debugMode) {
        return Effect.gen(function* () {
          const tracing = yield* TracingService;
          const trace = yield* tracing.getTrace();
          return jsonError(error.message, status, trace);
        });
      }
      return Effect.succeed(jsonError(error.message, status));
    }),
    Effect.provide(tracingLayer),
  );

  return appRuntime.runPromise(runnable);
}
