import { Effect } from "effect";
import { type NextRequest, NextResponse } from "next/server";
import { appRuntime } from "@/lib/effect/runtime";
import { RedisClient } from "@/lib/effect/services/redis";
import {
  DebugLog,
  type DebugLogEntry,
  DebugLogLive,
  DebugLogNoop,
  type DebugPayload,
  makeDebugTracerLayer,
} from "./service";

// ============================================================
// Shared Utilities
// ============================================================

function isDebugRequest(request: NextRequest): boolean {
  return request.headers.get("X-Debug") === "1";
}

async function injectDebugPayload(
  response: NextResponse,
  payload: DebugPayload,
): Promise<NextResponse> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const encoded = btoa(JSON.stringify(payload)).slice(0, 8192);
    const next = NextResponse.next();
    for (const [k, v] of response.headers.entries()) {
      next.headers.set(k, v);
    }
    next.headers.set("X-Debug-Log", encoded);
    return response;
  }

  const body = await response.json();
  const headers = new Headers(response.headers);
  return NextResponse.json(
    { ...body, __debug: payload },
    { status: response.status, headers },
  );
}

// ============================================================
// runWithDebug — for Effect-based routes
// ============================================================

export function runWithDebug(
  request: NextRequest,
  effect: Effect.Effect<NextResponse, unknown, RedisClient | DebugLog>,
  routeLabel: string,
): Promise<NextResponse> {
  const debug = isDebugRequest(request);

  if (!debug) {
    return appRuntime.runPromise(
      effect.pipe(Effect.provide(DebugLogNoop)) as Effect.Effect<
        NextResponse,
        unknown,
        RedisClient
      >,
    );
  }

  const startTime = performance.now();
  const traceId = crypto.randomUUID();

  const pipeline = Effect.gen(function* () {
    const response = yield* effect;
    const debugService = yield* DebugLog;
    const { logs, spans } = yield* debugService.collect();
    const durationMs = Math.round(performance.now() - startTime);

    const payload: DebugPayload = {
      route: routeLabel,
      durationMs,
      logs,
      spans,
    };
    return yield* Effect.promise(() => injectDebugPayload(response, payload));
  });

  return appRuntime.runPromise(
    pipeline.pipe(
      Effect.provide(DebugLogLive),
      Effect.provide(makeDebugTracerLayer(traceId)),
    ) as Effect.Effect<NextResponse, unknown, RedisClient>,
  );
}

// ============================================================
// withDebug — for non-Effect routes
// ============================================================

export interface ImperativeDebugLogger {
  log: (msg: string, attrs?: Record<string, unknown>) => void;
  warn: (msg: string, attrs?: Record<string, unknown>) => void;
  error: (msg: string, attrs?: Record<string, unknown>) => void;
}

const noopLogger: ImperativeDebugLogger = {
  log: () => {},
  warn: () => {},
  error: () => {},
};

function createCollectingLogger(): {
  logger: ImperativeDebugLogger;
  collect: () => DebugLogEntry[];
} {
  const entries: DebugLogEntry[] = [];
  const push = (
    level: DebugLogEntry["level"],
    msg: string,
    attrs?: Record<string, unknown>,
  ) => {
    entries.push({ level, msg, ts: Date.now(), ...(attrs ? { attrs } : {}) });
  };
  return {
    logger: {
      log: (msg, attrs) => push("info", msg, attrs),
      warn: (msg, attrs) => push("warn", msg, attrs),
      error: (msg, attrs) => push("error", msg, attrs),
    },
    collect: () => entries,
  };
}

export function withDebug(
  routeLabel: string,
  handler: (
    request: NextRequest,
    debug: ImperativeDebugLogger,
  ) => Promise<NextResponse>,
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    const debug = isDebugRequest(request);

    if (!debug) {
      return handler(request, noopLogger);
    }

    const startTime = performance.now();
    const { logger, collect } = createCollectingLogger();

    const response = await handler(request, logger);
    const durationMs = Math.round(performance.now() - startTime);

    const payload: DebugPayload = {
      route: routeLabel,
      durationMs,
      logs: collect(),
      spans: [],
    };

    return injectDebugPayload(response, payload);
  };
}

export { isDebugRequest };
