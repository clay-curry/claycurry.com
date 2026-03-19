import { Effect } from "effect";
import { type NextRequest, NextResponse } from "next/server";
import { appRuntime } from "@/lib/effect/runtime";
import { keyPrefix, RedisClient } from "@/lib/effect/services/redis";

const ENTRIES_KEY = `${keyPrefix()}guestbook:entries`;
const MAX_ENTRIES = 500;
const MAX_RETURNED = 50;
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_TTL = 60;

function rateLimitKey(ip: string): string {
  return `${keyPrefix()}guestbook:ratelimit:${ip}`;
}

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "");
}

export async function GET() {
  return appRuntime.runPromise(
    Effect.gen(function* () {
      const redis = yield* RedisClient;
      const raw = yield* redis.lRange(ENTRIES_KEY, 0, MAX_RETURNED - 1);
      const entries = raw.map((s) => JSON.parse(s));
      return NextResponse.json(entries);
    }).pipe(
      Effect.catchTag("RedisError", (err) => {
        console.error("Guestbook GET error:", err.message);
        return Effect.succeed(NextResponse.json([]));
      }),
    ),
  );
}

export async function POST(request: NextRequest) {
  return appRuntime.runPromise(
    Effect.gen(function* () {
      const body = yield* Effect.tryPromise({
        try: () => request.json(),
        catch: () => ({ _tag: "ParseError" as const }),
      });

      const name = stripHtml(String(body.name ?? "")).trim();
      const message = stripHtml(String(body.message ?? "")).trim();

      if (!name || name.length > 50) {
        return NextResponse.json(
          { error: "Name must be 1-50 characters" },
          { status: 400 },
        );
      }
      if (!message || message.length > 280) {
        return NextResponse.json(
          { error: "Message must be 1-280 characters" },
          { status: 400 },
        );
      }

      // Rate limit by IP
      const forwarded = request.headers.get("x-forwarded-for");
      const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
      const redis = yield* RedisClient;
      const rlKey = rateLimitKey(ip);
      const currentRaw = yield* redis.get(rlKey);
      const current = currentRaw ? Number.parseInt(currentRaw, 10) : 0;

      if (current >= RATE_LIMIT_MAX) {
        return NextResponse.json(
          { error: "Too many requests. Please wait a moment." },
          { status: 429 },
        );
      }

      const count = yield* redis.incr(rlKey);
      if (count === 1) {
        yield* redis.expire(rlKey, RATE_LIMIT_TTL);
      }

      const entry = {
        id: crypto.randomUUID(),
        name,
        message,
        createdAt: new Date().toISOString(),
      };

      yield* redis.lPush(ENTRIES_KEY, JSON.stringify(entry));
      yield* redis.lTrim(ENTRIES_KEY, 0, MAX_ENTRIES - 1);

      return NextResponse.json({ success: true, entry });
    }).pipe(
      Effect.catchTag("ParseError", () =>
        Effect.succeed(
          NextResponse.json({ error: "Invalid request body" }, { status: 400 }),
        ),
      ),
      Effect.catchTag("RedisError", (err) => {
        console.error("Guestbook POST error:", err.message);
        return Effect.succeed(
          NextResponse.json(
            { error: "Service temporarily unavailable" },
            { status: 503 },
          ),
        );
      }),
    ),
  );
}
