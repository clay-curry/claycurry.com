import { 
  type NextRequest, 
  NextResponse 
} from "next/server";

import { createClient } from "redis";

// In-memory fallback for local development (when Redis is not configured)
const inMemoryStore = new Map<string, number>();

// Lazy Redis client initialization
let redisClient: ReturnType<typeof createClient> | null = null;

async function getRedisClient() {
  
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

async function getViewCount(slug: string): Promise<number> {
  
  try {
    const client = await getRedisClient();
    if (!client) {
      return inMemoryStore.get(slug) ?? 0;
    }
    
    const count = await client.get(`pageviews:${slug}`);
    return count ? parseInt(count, 10) : 0;
  } catch (err) {
    console.error("Redis get error:", err);
    return inMemoryStore.get(slug) ?? 0;
  }
}

async function incrementViewCount(slug: string): Promise<number> {
  try {
    const client = await getRedisClient();
    if (!client) {
      const current = inMemoryStore.get(slug) ?? 0;
      const newCount = current + 1;
      inMemoryStore.set(slug, newCount);
      return newCount;
    }
    
    const count = await client.incr(`pageviews:${slug}`);
    return count;
  } catch (err) {
    console.error("Redis incr error:", err);
    const current = inMemoryStore.get(slug) ?? 0;
    const newCount = current + 1;
    inMemoryStore.set(slug, newCount);
    return newCount;
  }
}

// GET: Fetch view count without incrementing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Missing slug parameter" }, { status: 400 });
  }

  const count = await getViewCount(slug);
  return NextResponse.json({ slug, count });
}

// POST: Increment and return view count
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const slug = body.slug;

    if (!slug) {
      return NextResponse.json({ error: "Missing slug in request body" }, { status: 400 });
    }

    const count = await incrementViewCount(slug);
    return NextResponse.json({ slug, count });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
