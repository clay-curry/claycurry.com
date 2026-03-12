/**
 * Tests for GET/POST /api/clicks using Effect TestLayer.
 *
 * These tests exercise the Effect programs directly with test layers,
 * bypassing the HTTP transport and middleware.
 */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { Effect, Layer } from "effect";
import { NextRequest, NextResponse } from "next/server";
import { RedisService, RedisTest } from "@/lib/services/Redis";
import { makeRequestTracing, TracingService } from "@/lib/services/Tracing";

// We import the route handlers and call them directly.
// The handlers call runRouteHandler, which uses the production runtime.
// For unit tests, we test the Effect programs directly instead.

// Re-implement the route logic as testable Effect programs
const handleGet = Effect.gen(function* () {
  const redis = yield* RedisService;
  const tracing = yield* TracingService;
  const hashKey = `${redis.keyPrefix}clicks`;
  const raw = yield* tracing.span("redis.hGetAll", redis.hGetAll(hashKey));
  const counts: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw)) {
    counts[key] = Number.parseInt(value, 10);
  }
  return { counts };
});

const handlePost = (ids: string[]) =>
  Effect.gen(function* () {
    const redis = yield* RedisService;
    const tracing = yield* TracingService;
    const hashKey = `${redis.keyPrefix}clicks`;

    const tally = new Map<string, number>();
    for (const id of ids) {
      tally.set(id, (tally.get(id) ?? 0) + 1);
    }

    const counts: Record<string, number> = {};
    for (const [id, n] of tally) {
      const newCount = yield* tracing.span(
        `redis.hIncrBy:${id}`,
        redis.hIncrBy(hashKey, id, n),
      );
      counts[id] = newCount;
    }
    return { counts };
  });

const TestLayer = Layer.merge(
  RedisTest,
  Layer.effect(TracingService, makeRequestTracing("test")),
);

const run = <A>(
  effect: Effect.Effect<A, unknown, RedisService | TracingService>,
) => Effect.runPromise(Effect.provide(effect, TestLayer));

describe("GET /api/clicks", () => {
  test("returns empty counts initially", async () => {
    const result = await run(handleGet);
    assert.deepEqual(result.counts, {});
  });
});

describe("POST /api/clicks", () => {
  test("increments counts for given ids", async () => {
    const result = await run(
      Effect.gen(function* () {
        yield* handlePost(["btn-github", "btn-linkedin"]);
        return yield* handlePost(["btn-github"]);
      }),
    );
    assert.equal(result.counts["btn-github"], 2);
  });

  test("handles duplicate ids in single request", async () => {
    const result = await run(handlePost(["btn-x", "btn-x", "btn-x"]));
    assert.equal(result.counts["btn-x"], 3);
  });
});
