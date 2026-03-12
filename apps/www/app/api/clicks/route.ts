/**
 * @module api/clicks
 *
 * API Route: Click Tracking
 *
 * Tracks click counts for UI elements (social links, nav items, etc.)
 * using the RedisService Effect layer. Redis fallback to in-memory is
 * handled transparently by the service layer.
 *
 * Endpoints:
 * - GET /api/clicks — Retrieve all click counts
 * - POST /api/clicks { ids: string[] } — Increment click counts for given IDs
 *
 * Effect services used: RedisService, TracingService
 */
import { Effect } from "effect";
import { type NextRequest, NextResponse } from "next/server";
import { ValidationError } from "@/lib/effect/errors";
import { RedisService } from "@/lib/services/Redis";
import { TracingService } from "@/lib/services/Tracing";
import { runRouteHandler } from "../_shared/handler";

const handleGet = Effect.gen(function* () {
  const redis = yield* RedisService;
  const tracing = yield* TracingService;
  const hashKey = `${redis.keyPrefix}clicks`;

  const raw = yield* tracing.span("redis.hGetAll", redis.hGetAll(hashKey));
  const counts: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw)) {
    counts[key] = Number.parseInt(value, 10);
  }

  return NextResponse.json({ counts });
});

const handlePost = (req: NextRequest) =>
  Effect.gen(function* () {
    const redis = yield* RedisService;
    const tracing = yield* TracingService;

    const body = yield* Effect.tryPromise({
      try: () => req.json(),
      catch: () => new ValidationError({ message: "Invalid request body" }),
    });

    const ids: unknown = body.ids;
    if (!Array.isArray(ids) || ids.length === 0) {
      return yield* Effect.fail(
        new ValidationError({ message: "Missing or empty ids array" }),
      );
    }

    // Tally repeats
    const tally = new Map<string, number>();
    for (const id of ids) {
      if (typeof id !== "string") continue;
      tally.set(id, (tally.get(id) ?? 0) + 1);
    }

    const hashKey = `${redis.keyPrefix}clicks`;
    const counts: Record<string, number> = {};

    yield* Effect.logDebug("Click tally computed").pipe(
      Effect.annotateLogs("uniqueIds", tally.size),
    );

    for (const [id, n] of tally) {
      const newCount = yield* tracing.span(
        `redis.hIncrBy:${id}`,
        redis.hIncrBy(hashKey, id, n),
      );
      counts[id] = newCount;
    }

    return NextResponse.json({ counts });
  });

export async function GET(req: NextRequest) {
  return runRouteHandler(req, handleGet);
}

export async function POST(req: NextRequest) {
  return runRouteHandler(req, handlePost(req));
}
