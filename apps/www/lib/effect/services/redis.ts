import { Config, Context, Effect, Layer, Redacted } from "effect";
import { createClient, type RedisClientType } from "redis";

// ============================================================
// Service Interface
// ============================================================

export interface RedisMulti {
  readonly hIncrBy: (
    key: string,
    field: string,
    increment: number,
  ) => RedisMulti;
  readonly exec: () => Effect.Effect<unknown[], RedisError>;
}

export interface RedisService {
  readonly get: (key: string) => Effect.Effect<string | null, RedisError>;
  readonly set: (
    key: string,
    value: string,
    options?: { EX?: number },
  ) => Effect.Effect<void, RedisError>;
  readonly del: (key: string) => Effect.Effect<void, RedisError>;
  readonly incr: (key: string) => Effect.Effect<number, RedisError>;
  readonly hGetAll: (
    key: string,
  ) => Effect.Effect<Record<string, string>, RedisError>;
  readonly hIncrBy: (
    key: string,
    field: string,
    increment: number,
  ) => Effect.Effect<number, RedisError>;
  readonly multi: () => Effect.Effect<RedisMulti, RedisError>;
}

export class RedisClient extends Context.Tag("RedisClient")<
  RedisClient,
  RedisService
>() {}

// ============================================================
// Typed Error
// ============================================================

export class RedisError {
  readonly _tag = "RedisError" as const;
  constructor(
    readonly cause: unknown,
    readonly operation: string,
  ) {}

  get message(): string {
    return this.cause instanceof Error
      ? `Redis ${this.operation} failed: ${this.cause.message}`
      : `Redis ${this.operation} failed: ${String(this.cause)}`;
  }
}

// ============================================================
// Key Prefix (environment-aware)
// ============================================================

export function keyPrefix(): string {
  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv === "production") return "prod:";
  if (vercelEnv === "preview") return "preview:";
  return "dev:";
}

// ============================================================
// Live Redis Layer (with acquire/release)
// ============================================================

export const RedisLive = Layer.scoped(
  RedisClient,
  Effect.gen(function* () {
    const url = yield* Config.redacted("KV_REST_API_REDIS_URL").pipe(
      Effect.mapError((cause) => new RedisError(cause, "config")),
    );

    const client = yield* Effect.acquireRelease(
      Effect.tryPromise({
        try: async () => {
          const c = createClient({
            url: Redacted.value(url),
            socket: {
              reconnectStrategy: (retries) => Math.min(retries * 50, 3000),
            },
          });
          await c.connect();
          return c;
        },
        catch: (cause) => new RedisError(cause, "connect"),
      }).pipe(Effect.tap(() => Effect.logInfo("Redis client connected"))),
      (c) =>
        Effect.tryPromise(() => c.disconnect()).pipe(
          Effect.tap(() => Effect.logInfo("Redis client disconnected")),
          Effect.catchAll((err) =>
            Effect.logWarning(`Redis disconnect error: ${err}`),
          ),
        ),
    );

    const wrapOp = <A>(operation: string, fn: () => Promise<A>) =>
      Effect.tryPromise({
        try: fn,
        catch: (cause) => new RedisError(cause, operation),
      });

    return {
      get: (key) => wrapOp("get", () => client.get(key)),

      set: (key, value, options) =>
        wrapOp("set", () =>
          options?.EX
            ? client.set(key, value, { EX: options.EX }).then(() => void 0)
            : client.set(key, value).then(() => void 0),
        ),

      del: (key) => wrapOp("del", () => client.del(key).then(() => void 0)),

      incr: (key) => wrapOp("incr", () => client.incr(key)),

      hGetAll: (key) => wrapOp("hGetAll", () => client.hGetAll(key)),

      hIncrBy: (key, field, increment) =>
        wrapOp("hIncrBy", () => client.hIncrBy(key, field, increment)),

      multi: () =>
        Effect.sync(() => {
          const m = client.multi();
          const wrapper: RedisMulti = {
            hIncrBy: (key, field, increment) => {
              m.hIncrBy(key, field, increment);
              return wrapper;
            },
            exec: () => wrapOp("multi.exec", () => m.exec()),
          };
          return wrapper;
        }),
    } satisfies RedisService;
  }),
);

// ============================================================
// In-Memory Fallback Layer (no Redis URL configured)
// ============================================================

export const InMemoryRedisLive: Layer.Layer<RedisClient> = Layer.sync(
  RedisClient,
  () => {
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

    return {
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
    } satisfies RedisService;
  },
);

// ============================================================
// Auto-selecting Layer (Redis if URL is set, else in-memory)
// ============================================================

export const RedisLayer = process.env.KV_REST_API_REDIS_URL
  ? RedisLive
  : InMemoryRedisLive;
