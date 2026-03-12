import { Effect } from "effect";
import { type NextRequest, NextResponse } from "next/server";
import { appRuntime } from "@/lib/effect/runtime";
import { keyPrefix, RedisClient } from "@/lib/effect/services/redis";

const clicksKey = `${keyPrefix()}clicks`;

const getAllCounts = Effect.gen(function* () {
  const redis = yield* RedisClient;
  const raw = yield* redis.hGetAll(clicksKey);
  const counts: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw)) {
    counts[key] = Number.parseInt(value, 10);
  }
  return counts;
});

export async function GET() {
  return appRuntime.runPromise(
    getAllCounts.pipe(
      Effect.map((counts) => NextResponse.json({ counts })),
      Effect.catchTag("RedisError", (err) => {
        console.error("Redis hGetAll error:", err.message);
        return Effect.succeed(NextResponse.json({ counts: {} }));
      }),
    ),
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ids: string[] = body.ids;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Missing or empty ids array" },
        { status: 400 },
      );
    }

    // Tally repeats
    const tally = new Map<string, number>();
    for (const id of ids) {
      tally.set(id, (tally.get(id) ?? 0) + 1);
    }

    return await appRuntime.runPromise(
      Effect.gen(function* () {
        const redis = yield* RedisClient;
        const entries = Array.from(tally.entries());
        const m = yield* redis.multi();

        for (const [id, n] of entries) {
          m.hIncrBy(clicksKey, id, n);
        }

        const results = yield* m.exec();
        const counts: Record<string, number> = {};

        for (const [index, [id]] of entries.entries()) {
          const result = results[index];
          const newCount =
            typeof result === "number"
              ? result
              : Number.parseInt(String(result), 10);
          if (Number.isNaN(newCount)) {
            return NextResponse.json(
              { error: `Invalid Redis count for click id: ${id}` },
              { status: 500 },
            );
          }
          counts[id] = newCount;
        }

        return NextResponse.json({ counts });
      }).pipe(
        Effect.catchTag("RedisError", (err) => {
          console.error("Redis hIncrBy error:", err.message);
          return Effect.succeed(NextResponse.json({ counts: {} }));
        }),
      ),
    );
  } catch (err) {
    console.error("Clicks POST parse error:", err);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
