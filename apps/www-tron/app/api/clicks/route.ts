import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from 'redis'

const inMemoryStore = new Map<string, number>()

let redisClient: ReturnType<typeof createClient> | null = null

async function getRedisClient() {
  if (!process.env.KV_REST_API_REDIS_URL) {
    return null
  }

  if (!redisClient) {
    redisClient = createClient({
      url: process.env.KV_REST_API_REDIS_URL,
    })
    redisClient.on('error', (err) => console.error('Redis Client Error', err))
    await redisClient.connect()
  }

  return redisClient
}

export async function GET() {
  try {
    const client = await getRedisClient()
    if (!client) {
      const counts: Record<string, number> = {}
      for (const [key, value] of inMemoryStore) {
        counts[key] = value
      }
      return NextResponse.json({ counts })
    }

    const raw = await client.hGetAll('clicks')
    const counts: Record<string, number> = {}
    for (const [key, value] of Object.entries(raw)) {
      counts[key] = parseInt(value, 10)
    }
    return NextResponse.json({ counts })
  } catch (err) {
    console.error('Redis hGetAll error:', err)
    const counts: Record<string, number> = {}
    for (const [key, value] of inMemoryStore) {
      counts[key] = value
    }
    return NextResponse.json({ counts })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const ids: string[] = body.ids

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Missing or empty ids array' },
        { status: 400 },
      )
    }

    // Tally repeats
    const tally = new Map<string, number>()
    for (const id of ids) {
      tally.set(id, (tally.get(id) ?? 0) + 1)
    }

    const counts: Record<string, number> = {}

    try {
      const client = await getRedisClient()
      if (!client) {
        for (const [id, n] of tally) {
          const current = inMemoryStore.get(id) ?? 0
          const newCount = current + n
          inMemoryStore.set(id, newCount)
          counts[id] = newCount
        }
        return NextResponse.json({ counts })
      }

      for (const [id, n] of tally) {
        const newCount = await client.hIncrBy('clicks', id, n)
        counts[id] = newCount
      }
      return NextResponse.json({ counts })
    } catch (err) {
      console.error('Redis hIncrBy error:', err)
      for (const [id, n] of tally) {
        const current = inMemoryStore.get(id) ?? 0
        const newCount = current + n
        inMemoryStore.set(id, newCount)
        counts[id] = newCount
      }
      return NextResponse.json({ counts })
    }
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 },
    )
  }
}
