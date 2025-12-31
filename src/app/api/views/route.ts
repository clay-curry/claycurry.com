import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

// In-memory fallback for local development (when KV is not configured)
const inMemoryStore = new Map<string, number>();

async function getViewCount(slug: string): Promise<number> {
  try {
    // Try Vercel KV first
    const count = await kv.get<number>(`pageviews:${slug}`);
    return count ?? 0;
  } catch {
    // Fallback to in-memory store for local dev
    return inMemoryStore.get(slug) ?? 0;
  }
}

async function incrementViewCount(slug: string): Promise<number> {
  try {
    // Try Vercel KV first
    const count = await kv.incr(`pageviews:${slug}`);
    return count;
  } catch {
    // Fallback to in-memory store for local dev
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
