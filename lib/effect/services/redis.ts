import { Context, Effect, Layer } from "effect";
import { createClient } from "redis";

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
  readonly rPush: (
    key: string,
    value: string,
  ) => Effect.Effect<number, RedisError>;
  readonly lLen: (key: string) => Effect.Effect<number, RedisError>;
  readonly lRange: (
    key: string,
    start: number,
    stop: number,
  ) => Effect.Effect<string[], RedisError>;
  readonly lPush: (
    key: string,
    value: string,
  ) => Effect.Effect<number, RedisError>;
  readonly lTrim: (
    key: string,
    start: number,
    stop: number,
  ) => Effect.Effect<void, RedisError>;
  readonly expire: (
    key: string,
    seconds: number,
  ) => Effect.Effect<number, RedisError>;
  readonly hSet: (
    key: string,
    field: string,
    value: string,
  ) => Effect.Effect<number, RedisError>;
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
// Connection string resolution
// ============================================================

function resolveRedisUrl(): string | null {
  const value = process.env.KV_REST_API_REDIS_URL;
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }
  return null;
}

const redisUrlConfig = resolveRedisUrl();

// ============================================================
// Live Redis Layer (with acquire/release)
// ============================================================

export const RedisLive = Layer.scoped(
  RedisClient,
  Effect.gen(function* () {
    if (!redisUrlConfig) {
      return yield* Effect.fail(
        new RedisError(
          new Error(
            `Set "KV_REST_API_REDIS_URL" to enable persistent Redis storage.`,
          ),
          "config",
        ),
      );
    }

    const client = yield* Effect.acquireRelease(
      Effect.tryPromise({
        try: async () => {
          const c = createClient({
            url: redisUrlConfig,
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

      lPush: (key, value) => wrapOp("lPush", () => client.lPush(key, value)),

      lTrim: (key, start, stop) =>
        wrapOp("lTrim", () =>
          client.lTrim(key, start, stop).then(() => void 0),
        ),

      rPush: (key, value) => wrapOp("rPush", () => client.rPush(key, value)),

      lLen: (key) => wrapOp("lLen", () => client.lLen(key)),

      lRange: (key, start, stop) =>
        wrapOp("lRange", () => client.lRange(key, start, stop)),

      expire: (key, seconds) =>
        wrapOp("expire", () => client.expire(key, seconds)),

      hSet: (key, field, value) =>
        wrapOp("hSet", () =>
          client.hSet(key, field, value).then((n) => Number(n)),
        ),
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
    const listStore = new Map<string, string[]>();

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

      lPush: (key, value) =>
        Effect.sync(() => {
          let list = listStore.get(key);
          if (!list) {
            list = [];
            listStore.set(key, list);
          }
          list.unshift(value);
          return list.length;
        }),

      lTrim: (key, start, stop) =>
        Effect.sync(() => {
          const list = listStore.get(key);
          if (list) {
            const end = stop === -1 ? list.length : stop + 1;
            const trimmed = list.slice(start, end);
            listStore.set(key, trimmed);
          }
        }),

      rPush: (key, value) =>
        Effect.sync(() => {
          let list = listStore.get(key);
          if (!list) {
            list = [];
            listStore.set(key, list);
          }
          list.push(value);
          return list.length;
        }),

      lLen: (key) => Effect.sync(() => listStore.get(key)?.length ?? 0),

      lRange: (key, start, stop) =>
        Effect.sync(() => {
          const list = listStore.get(key);
          if (!list) return [];
          const end = stop === -1 ? list.length : stop + 1;
          return list.slice(start, end);
        }),

      expire: (_key, _seconds) => Effect.sync(() => 1),

      hSet: (key, field, value) =>
        Effect.sync(() => {
          let hash = hashStore.get(key);
          if (!hash) {
            hash = new Map();
            hashStore.set(key, hash);
          }
          const isNew = !hash.has(field);
          hash.set(field, value);
          return isNew ? 1 : 0;
        }),
    } satisfies RedisService;
  },
);

// ============================================================
// Auto-selecting Layer (Redis if URL is set, else in-memory)
// ============================================================

export const RedisLayer = redisUrlConfig ? RedisLive : InMemoryRedisLive;
