/**
 * @module services/Redis
 *
 * Effect service abstracting Redis operations with automatic in-memory
 * fallback. Replaces the duplicated `getRedisClient()` / `getInMemoryStore()`
 * pattern found across 5+ modules (clicks, views, x/cache, x/auth, x/callback).
 *
 * The fallback is handled internally by the Layer, so consumers never see it —
 * they simply call `RedisService.get(key)` and get a result regardless of
 * whether Redis is available.
 *
 * Operations: get, set, del, incr, hGetAll, hIncrBy
 *
 * Layers:
 * - `RedisLive` — connects to real Redis, falls back to in-memory on failure
 * - `RedisTest` — Ref-based in-memory implementation for unit tests
 *
 * @example
 * ```ts
 * const program = Effect.gen(function* () {
 *   const redis = yield* RedisService
 *   const count = yield* redis.incr("pageviews:my-post")
 *   return count
 * })
 * ```
 */
import { Context, Effect, Layer } from "effect";
import { createClient } from "redis";

/** Compute the environment-aware key prefix */
function keyPrefix(): string {
  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv === "production") return "prod:";
  if (vercelEnv === "preview") return "preview:";
  return "dev:";
}

/** The interface exposed to consumers */
export interface RedisServiceInterface {
  readonly get: (key: string) => Effect.Effect<string | null>;
  readonly set: (
    key: string,
    value: string,
    options?: { readonly ex?: number },
  ) => Effect.Effect<void>;
  readonly del: (key: string) => Effect.Effect<void>;
  readonly incr: (key: string) => Effect.Effect<number>;
  readonly hGetAll: (key: string) => Effect.Effect<Record<string, string>>;
  readonly hIncrBy: (
    key: string,
    field: string,
    increment: number,
  ) => Effect.Effect<number>;
  readonly keyPrefix: string;
}

export class RedisService extends Context.Tag("RedisService")<
  RedisService,
  RedisServiceInterface
>() {}

// ─── In-Memory implementation (used as fallback and by RedisTest) ────────────

function makeInMemoryRedis(
  store: Map<string, string>,
  prefix: string,
): RedisServiceInterface {
  return {
    keyPrefix: prefix,

    get: (key) =>
      Effect.sync(() => {
        return store.get(key) ?? null;
      }),

    set: (key, value) =>
      Effect.sync(() => {
        store.set(key, value);
      }),

    del: (key) =>
      Effect.sync(() => {
        store.delete(key);
      }),

    incr: (key) =>
      Effect.sync(() => {
        const current = Number.parseInt(store.get(key) ?? "0", 10);
        const next = current + 1;
        store.set(key, String(next));
        return next;
      }),

    hGetAll: (key) =>
      Effect.sync(() => {
        const prefix = `${key}:`;
        const result: Record<string, string> = {};
        for (const [k, v] of store) {
          if (k.startsWith(prefix)) {
            result[k.slice(prefix.length)] = v;
          }
        }
        // Also check for exact hash key pattern (field stored as hash:field)
        return result;
      }),

    hIncrBy: (key, field, increment) =>
      Effect.sync(() => {
        const compositeKey = `${key}:${field}`;
        const current = Number.parseInt(store.get(compositeKey) ?? "0", 10);
        const next = current + increment;
        store.set(compositeKey, String(next));
        return next;
      }),
  };
}

// ─── Live Layer: real Redis with automatic in-memory fallback ────────────────

function makeRedisLive(
  client: ReturnType<typeof createClient>,
  prefix: string,
  fallback: RedisServiceInterface,
): RedisServiceInterface {
  return {
    keyPrefix: prefix,

    get: (key) =>
      Effect.tryPromise({
        try: () => client.get(key),
        catch: () => null,
      }).pipe(Effect.orElse(() => fallback.get(key))),

    set: (key, value, options) =>
      Effect.tryPromise({
        try: () =>
          options?.ex
            ? client.set(key, value, { EX: options.ex }).then(() => undefined)
            : client.set(key, value).then(() => undefined),
        catch: () => undefined,
      }).pipe(Effect.orElse(() => fallback.set(key, value, options))),

    del: (key) =>
      Effect.tryPromise({
        try: () => client.del(key).then(() => undefined),
        catch: () => undefined,
      }).pipe(Effect.orElse(() => fallback.del(key))),

    incr: (key) =>
      Effect.tryPromise({
        try: () => client.incr(key),
        catch: () => "redis-error" as const,
      }).pipe(Effect.orElse(() => fallback.incr(key))),

    hGetAll: (key) =>
      Effect.tryPromise({
        try: () => client.hGetAll(key),
        catch: () => ({}) as Record<string, string>,
      }).pipe(Effect.orElse(() => fallback.hGetAll(key))),

    hIncrBy: (key, field, increment) =>
      Effect.tryPromise({
        try: () => client.hIncrBy(key, field, increment),
        catch: () => "redis-error" as const,
      }).pipe(Effect.orElse(() => fallback.hIncrBy(key, field, increment))),
  };
}

/**
 * Production Layer. Attempts to connect to Redis. If `KV_REST_API_REDIS_URL`
 * is unset or connection fails, transparently falls back to an in-memory Map.
 */
export const RedisLive = Layer.effect(
  RedisService,
  Effect.gen(function* () {
    const prefix = keyPrefix();
    const memoryStore = new Map<string, string>();
    const fallback = makeInMemoryRedis(memoryStore, prefix);

    const url = process.env.KV_REST_API_REDIS_URL;
    if (!url) {
      yield* Effect.logWarning(
        "Redis URL not configured, using in-memory store",
      );
      return fallback;
    }

    return yield* Effect.tryPromise({
      try: async () => {
        const client = createClient({ url });
        client.on("error", () => {
          /* swallow reconnect noise */
        });
        await client.connect();
        return makeRedisLive(client, prefix, fallback);
      },
      catch: () => {
        return fallback;
      },
    }).pipe(
      Effect.tap((svc) =>
        svc === fallback
          ? Effect.logWarning("Redis connection failed, using in-memory store")
          : Effect.logInfo("Redis connected"),
      ),
    );
  }),
);

/**
 * Test Layer. Provides a Ref-backed in-memory implementation.
 * Tests can inspect the underlying Ref to assert on stored values.
 */
export const makeRedisTest = (initialData?: Record<string, string>) =>
  Layer.effect(
    RedisService,
    Effect.sync(() => {
      const store = new Map<string, string>(
        initialData ? Object.entries(initialData) : [],
      );
      return makeInMemoryRedis(store, "test:");
    }),
  );

export const RedisTest = makeRedisTest();
