import { type NextRequest, NextResponse } from "next/server";
import { getInMemoryStore, getRedisClient, keyPrefix } from "@/lib/redis";

export async function GET() {
  const inMemoryStore = getInMemoryStore();
  try {
    const client = await getRedisClient();
    if (!client) {
      const counts: Record<string, number> = {};
      for (const [key, value] of inMemoryStore) {
        counts[key] = value;
      }
      return NextResponse.json({ counts });
    }

    const raw = await client.hGetAll(`${keyPrefix()}clicks`);
    const counts: Record<string, number> = {};
    for (const [key, value] of Object.entries(raw)) {
      counts[key] = parseInt(value, 10);
    }
    return NextResponse.json({ counts });
  } catch (err) {
    console.error("Redis hGetAll error:", err);
    const counts: Record<string, number> = {};
    for (const [key, value] of inMemoryStore) {
      counts[key] = value;
    }
    return NextResponse.json({ counts });
  }
}

export async function POST(request: NextRequest) {
  const inMemoryStore = getInMemoryStore();
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

    const counts: Record<string, number> = {};
    const hashKey = `${keyPrefix()}clicks`;

    try {
      const client = await getRedisClient();
      if (!client) {
        for (const [id, n] of tally) {
          const current = inMemoryStore.get(id) ?? 0;
          const newCount = current + n;
          inMemoryStore.set(id, newCount);
          counts[id] = newCount;
        }
        return NextResponse.json({ counts });
      }

      const entries = Array.from(tally.entries());
      const multi = client.multi();
      for (const [id, n] of entries) {
        multi.hIncrBy(hashKey, id, n);
      }

      const results = await multi.exec();
      if (!results) {
        throw new Error("Redis transaction returned no results");
      }

      for (const [index, [id]] of entries.entries()) {
        const result = results[index];
        const newCount =
          typeof result === "number"
            ? result
            : Number.parseInt(String(result), 10);
        if (Number.isNaN(newCount)) {
          throw new Error(`Invalid Redis count for click id: ${id}`);
        }
        counts[id] = newCount;
      }
      return NextResponse.json({ counts });
    } catch (err) {
      console.error("Redis hIncrBy error:", err);
      for (const [id, n] of tally) {
        const current = inMemoryStore.get(id) ?? 0;
        const newCount = current + n;
        inMemoryStore.set(id, newCount);
        counts[id] = newCount;
      }
      return NextResponse.json({ counts });
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
