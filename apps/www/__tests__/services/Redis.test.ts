/**
 * Tests for RedisService Effect layer.
 * Uses the RedisTest (in-memory) layer to verify all operations.
 */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { Effect } from "effect";
import { makeRedisTest, RedisService, RedisTest } from "@/lib/services/Redis";

const run = <A>(effect: Effect.Effect<A, never, RedisService>) =>
  Effect.runPromise(Effect.provide(effect, RedisTest));

describe("RedisService", () => {
  test("get returns null for missing key", async () => {
    const result = await run(
      Effect.gen(function* () {
        const redis = yield* RedisService;
        return yield* redis.get("nonexistent");
      }),
    );
    assert.equal(result, null);
  });

  test("set and get round-trip", async () => {
    const result = await run(
      Effect.gen(function* () {
        const redis = yield* RedisService;
        yield* redis.set("mykey", "hello");
        return yield* redis.get("mykey");
      }),
    );
    assert.equal(result, "hello");
  });

  test("del removes a key", async () => {
    const result = await run(
      Effect.gen(function* () {
        const redis = yield* RedisService;
        yield* redis.set("mykey", "hello");
        yield* redis.del("mykey");
        return yield* redis.get("mykey");
      }),
    );
    assert.equal(result, null);
  });

  test("incr increments from 0", async () => {
    const result = await run(
      Effect.gen(function* () {
        const redis = yield* RedisService;
        const first = yield* redis.incr("counter");
        const second = yield* redis.incr("counter");
        return { first, second };
      }),
    );
    assert.equal(result.first, 1);
    assert.equal(result.second, 2);
  });

  test("hIncrBy increments hash fields", async () => {
    const result = await run(
      Effect.gen(function* () {
        const redis = yield* RedisService;
        const a = yield* redis.hIncrBy("myhash", "field1", 5);
        const b = yield* redis.hIncrBy("myhash", "field1", 3);
        const c = yield* redis.hIncrBy("myhash", "field2", 1);
        return { a, b, c };
      }),
    );
    assert.equal(result.a, 5);
    assert.equal(result.b, 8);
    assert.equal(result.c, 1);
  });

  test("hGetAll returns all hash fields", async () => {
    const result = await run(
      Effect.gen(function* () {
        const redis = yield* RedisService;
        yield* redis.hIncrBy("myhash", "x", 10);
        yield* redis.hIncrBy("myhash", "y", 20);
        return yield* redis.hGetAll("myhash");
      }),
    );
    assert.equal(result.x, "10");
    assert.equal(result.y, "20");
  });

  test("keyPrefix is 'test:' in test layer", async () => {
    const result = await run(
      Effect.gen(function* () {
        const redis = yield* RedisService;
        return redis.keyPrefix;
      }),
    );
    assert.equal(result, "test:");
  });

  test("makeRedisTest accepts initial data", async () => {
    const layer = makeRedisTest({ "pre:key": "value" });
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const redis = yield* RedisService;
        return yield* redis.get("pre:key");
      }).pipe(Effect.provide(layer)),
    );
    assert.equal(result, "value");
  });
});
