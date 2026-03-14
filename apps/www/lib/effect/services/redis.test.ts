import { Effect, Layer } from "effect";
import { describe, expect, test } from "vitest";
import { RedisClient, type RedisMulti, type RedisService } from "./redis";

function createTestLayer(): Layer.Layer<RedisClient> {
  const store = new Map<string, { value: string; expiresAt?: number }>();
  const hashStore = new Map<string, Map<string, string>>();

  function getEntry(key: string): string | null {
    const entry = store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt <= Date.now()) {
      store.delete(key);
      return null;
    }
    return entry.value;
  }

  return Layer.succeed(RedisClient, {
    get: (key) => Effect.sync(() => getEntry(key)),
    set: (key, value, options) =>
      Effect.sync(() => {
        store.set(key, {
          value,
          expiresAt: options?.EX ? Date.now() + options.EX * 1000 : undefined,
        });
      }),
    del: (key) =>
      Effect.sync(() => {
        store.delete(key);
      }),
    incr: (key) =>
      Effect.sync(() => {
        const current = Number(getEntry(key) || "0");
        const next = current + 1;
        store.set(key, { value: String(next) });
        return next;
      }),
    hGetAll: (key) =>
      Effect.sync(() => {
        const hash = hashStore.get(key);
        if (!hash) return {};
        return Object.fromEntries(hash);
      }),
    hIncrBy: (key, field, increment) =>
      Effect.sync(() => {
        let hash = hashStore.get(key);
        if (!hash) {
          hash = new Map();
          hashStore.set(key, hash);
        }
        const current = Number(hash.get(field) || "0");
        const next = current + increment;
        hash.set(field, String(next));
        return next;
      }),
    multi: () =>
      Effect.sync(() => {
        const ops: Array<() => unknown> = [];
        const wrapper: RedisMulti = {
          hIncrBy: (key, field, increment) => {
            ops.push(() => {
              let hash = hashStore.get(key);
              if (!hash) {
                hash = new Map();
                hashStore.set(key, hash);
              }
              const current = Number(hash.get(field) || "0");
              const next = current + increment;
              hash.set(field, String(next));
              return next;
            });
            return wrapper;
          },
          exec: () => Effect.sync(() => ops.map((op) => op())),
        };
        return wrapper;
      }),
    rPush: () => Effect.succeed(1),
    lLen: () => Effect.succeed(0),
    lRange: () => Effect.succeed([]),
    expire: () => Effect.succeed(1),
    hSet: () => Effect.succeed(1),
  } satisfies RedisService);
}

function run<A, E>(effect: Effect.Effect<A, E, RedisClient>): Promise<A> {
  return Effect.runPromise(
    Effect.provide(effect, createTestLayer()) as Effect.Effect<A, never>,
  );
}

describe("RedisClient mock layer", () => {
  test("get returns null for missing keys", async () => {
    const result = await run(
      Effect.gen(function* () {
        const redis = yield* RedisClient;
        return yield* redis.get("nonexistent");
      }),
    );
    expect(result).toBeNull();
  });

  test("set then get returns the stored value", async () => {
    const result = await run(
      Effect.gen(function* () {
        const redis = yield* RedisClient;
        yield* redis.set("key1", "hello");
        return yield* redis.get("key1");
      }),
    );
    expect(result).toBe("hello");
  });

  test("del removes a key", async () => {
    const result = await run(
      Effect.gen(function* () {
        const redis = yield* RedisClient;
        yield* redis.set("key2", "value");
        yield* redis.del("key2");
        return yield* redis.get("key2");
      }),
    );
    expect(result).toBeNull();
  });

  test("incr increments from 0", async () => {
    const result = await run(
      Effect.gen(function* () {
        const redis = yield* RedisClient;
        const first = yield* redis.incr("counter");
        const second = yield* redis.incr("counter");
        return [first, second];
      }),
    );
    expect(result).toEqual([1, 2]);
  });

  test("hGetAll returns empty object for missing hash", async () => {
    const result = await run(
      Effect.gen(function* () {
        const redis = yield* RedisClient;
        return yield* redis.hGetAll("nohash");
      }),
    );
    expect(result).toEqual({});
  });

  test("hIncrBy creates and increments hash fields", async () => {
    const result = await run(
      Effect.gen(function* () {
        const redis = yield* RedisClient;
        const a = yield* redis.hIncrBy("clicks", "btn-1", 3);
        const b = yield* redis.hIncrBy("clicks", "btn-1", 2);
        const c = yield* redis.hIncrBy("clicks", "btn-2", 1);
        const all = yield* redis.hGetAll("clicks");
        return { a, b, c, all };
      }),
    );
    expect(result.a).toBe(3);
    expect(result.b).toBe(5);
    expect(result.c).toBe(1);
    expect(result.all).toEqual({ "btn-1": "5", "btn-2": "1" });
  });

  test("multi batches hIncrBy operations", async () => {
    const result = await run(
      Effect.gen(function* () {
        const redis = yield* RedisClient;
        const m = yield* redis.multi();
        m.hIncrBy("mhash", "a", 10).hIncrBy("mhash", "b", 20);
        const results = yield* m.exec();
        const all = yield* redis.hGetAll("mhash");
        return { results, all };
      }),
    );
    expect(result.results).toEqual([10, 20]);
    expect(result.all).toEqual({ a: "10", b: "20" });
  });

  test("set with EX stores expiry metadata", async () => {
    const result = await run(
      Effect.gen(function* () {
        const redis = yield* RedisClient;
        yield* redis.set("expiring", "value", { EX: 3600 });
        return yield* redis.get("expiring");
      }),
    );
    expect(result).toBe("value");
  });
});

describe("RedisClient service interface", () => {
  test("custom test layer can be provided", async () => {
    const TestRedis = Layer.succeed(RedisClient, {
      get: () => Effect.succeed("mocked"),
      set: () => Effect.void,
      del: () => Effect.void,
      incr: () => Effect.succeed(42),
      hGetAll: () => Effect.succeed({}),
      hIncrBy: () => Effect.succeed(0),
      multi: () =>
        Effect.succeed({
          hIncrBy: function (this: any) {
            return this;
          },
          exec: () => Effect.succeed([]),
        }),
      rPush: () => Effect.succeed(1),
      lLen: () => Effect.succeed(0),
      lRange: () => Effect.succeed([]),
      expire: () => Effect.succeed(1),
      hSet: () => Effect.succeed(1),
    } satisfies RedisService);

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const redis = yield* RedisClient;
        return yield* redis.get("anything");
      }).pipe(Effect.provide(TestRedis)),
    );
    expect(result).toBe("mocked");
  });
});
