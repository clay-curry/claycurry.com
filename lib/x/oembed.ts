import { Effect } from "effect";
import { appRuntime } from "@/lib/effect/runtime";
import { keyPrefix, RedisClient } from "@/lib/effect/services/redis";

export interface OEmbedResponse {
  url: string;
  author_name: string;
  author_url: string;
  html: string;
  width: number | null;
  height: number | null;
  type: string;
  cache_age: string;
  provider_name: string;
  provider_url: string;
  version: string;
}

const OEMBED_CACHE_TTL = 24 * 60 * 60; // 24 hours in seconds
const OEMBED_FETCH_CONCURRENCY = 8;

function cacheKey(tweetId: string): string {
  return `${keyPrefix()}x:oembed:${tweetId}`;
}

async function getCachedOEmbed(
  tweetId: string,
): Promise<OEmbedResponse | null> {
  const key = cacheKey(tweetId);
  return appRuntime.runPromise(
    Effect.gen(function* () {
      const redis = yield* RedisClient;
      const raw = yield* redis.get(key);
      return raw ? (JSON.parse(raw) as OEmbedResponse) : null;
    }).pipe(
      Effect.catchTag("RedisError", (err) => {
        console.error("Redis oEmbed get error:", err.message);
        return Effect.succeed(null);
      }),
    ),
  );
}

async function setCachedOEmbed(
  tweetId: string,
  data: OEmbedResponse,
): Promise<void> {
  const key = cacheKey(tweetId);
  const json = JSON.stringify(data);
  await appRuntime.runPromise(
    Effect.gen(function* () {
      const redis = yield* RedisClient;
      yield* redis.set(key, json, { EX: OEMBED_CACHE_TTL });
    }).pipe(
      Effect.catchTag("RedisError", (err) => {
        console.error("Redis oEmbed set error:", err.message);
        return Effect.void;
      }),
    ),
  );
}

export async function fetchOEmbed(
  tweetUrl: string,
): Promise<OEmbedResponse | null> {
  const params = new URLSearchParams({
    url: tweetUrl,
    omit_script: "true",
    dnt: "true",
    theme: "dark",
  });

  const res = await fetch(`https://publish.x.com/oembed?${params.toString()}`);
  if (!res.ok) return null;
  return (await res.json()) as OEmbedResponse;
}

export async function fetchOEmbedBatch(
  bookmarks: { id: string; authorUsername: string }[],
): Promise<Map<string, OEmbedResponse>> {
  const result = new Map<string, OEmbedResponse>();
  const uncached: { id: string; authorUsername: string }[] = [];

  const cacheResults = await Promise.all(
    bookmarks.map(async (bookmark) => ({
      bookmark,
      cached: await getCachedOEmbed(bookmark.id),
    })),
  );

  for (const { bookmark, cached } of cacheResults) {
    if (cached) {
      result.set(bookmark.id, cached);
    } else {
      uncached.push(bookmark);
    }
  }

  for (let i = 0; i < uncached.length; i += OEMBED_FETCH_CONCURRENCY) {
    const batch = uncached.slice(i, i + OEMBED_FETCH_CONCURRENCY);
    const settled = await Promise.allSettled(
      batch.map(async (bookmark) => {
        const url = `https://x.com/${bookmark.authorUsername}/status/${bookmark.id}`;
        const data = await fetchOEmbed(url);
        if (data) {
          await setCachedOEmbed(bookmark.id, data);
          result.set(bookmark.id, data);
        }
      }),
    );

    for (const outcome of settled) {
      if (outcome.status === "rejected") {
        console.error("oEmbed fetch failed:", outcome.reason);
      }
    }
  }

  return result;
}
