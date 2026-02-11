import { createClient } from "redis";

const inMemoryStore = new Map<string, number>();

let redisClient: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (!process.env.KV_REST_API_REDIS_URL) {
    return null;
  }

  if (!redisClient) {
    redisClient = createClient({
      url: process.env.KV_REST_API_REDIS_URL,
    });
    redisClient.on("error", (err) => console.error("Redis Client Error", err));
    await redisClient.connect();
  }

  return redisClient;
}

export function getInMemoryStore() {
  return inMemoryStore;
}

export function keyPrefix(): string {
  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv === "production") return "prod:";
  if (vercelEnv === "preview") return "preview:";
  if (vercelEnv === "development") return "dev:";
  // Local dev (VERCEL_ENV not set)
  if (process.env.NODE_ENV === "development") return "dev:";
  return "dev:";
}
