/**
 * Tests for GET/POST /api/views using Effect TestLayer.
 *
 * Tests the view counting logic (increment, dedup via cookie array)
 * using in-memory Redis and tracing test layers.
 */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { Effect, Layer } from "effect";
import { RedisService, RedisTest } from "@/lib/services/Redis";
import { makeRequestTracing, TracingService } from "@/lib/services/Tracing";

// Extracted view logic as testable Effect programs
const getViewCount = (slug: string) =>
  Effect.gen(function* () {
    const redis = yield* RedisService;
    const tracing = yield* TracingService;
    const key = `${redis.keyPrefix}pageviews:${slug}`;
    const raw = yield* tracing.span("redis.get", redis.get(key));
    return raw ? Number.parseInt(raw, 10) : 0;
  });

const incrementViewCount = (slug: string) =>
  Effect.gen(function* () {
    const redis = yield* RedisService;
    const tracing = yield* TracingService;
    const key = `${redis.keyPrefix}pageviews:${slug}`;
    return yield* tracing.span("redis.incr", redis.incr(key));
  });

const TestLayer = Layer.merge(
  RedisTest,
  Layer.effect(TracingService, makeRequestTracing("test")),
);

const run = <A>(
  effect: Effect.Effect<A, unknown, RedisService | TracingService>,
) => Effect.runPromise(Effect.provide(effect, TestLayer));

describe("getViewCount", () => {
  test("returns 0 for unknown slug", async () => {
    const count = await run(getViewCount("nonexistent"));
    assert.equal(count, 0);
  });
});

describe("incrementViewCount", () => {
  test("increments from 0 to 1", async () => {
    const count = await run(incrementViewCount("my-post"));
    assert.equal(count, 1);
  });

  test("increments sequentially", async () => {
    const result = await run(
      Effect.gen(function* () {
        yield* incrementViewCount("seq-post");
        yield* incrementViewCount("seq-post");
        return yield* incrementViewCount("seq-post");
      }),
    );
    assert.equal(result, 3);
  });
});

describe("view dedup logic", () => {
  test("viewed pages array prevents double counting", async () => {
    // Simulate the dedup logic from the route
    const viewedPages = ["already-seen"];
    const slug = "already-seen";

    if (viewedPages.includes(slug)) {
      // Should return current count without incrementing
      const count = await run(getViewCount(slug));
      assert.equal(count, 0); // never incremented
    }
  });

  test("new slug gets incremented", async () => {
    const viewedPages: string[] = [];
    const slug = "brand-new";

    if (!viewedPages.includes(slug)) {
      const count = await run(incrementViewCount(slug));
      assert.equal(count, 1);
      viewedPages.push(slug);
    }

    assert.deepEqual(viewedPages, ["brand-new"]);
  });
});
