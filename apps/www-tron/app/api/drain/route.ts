/**
 * API Route: Log Drain Receiver
 *
 * Receives log data from Vercel Log Drains and tracks referrer sources.
 * Parses the `ref` query parameter from request URLs to identify traffic sources.
 *
 * @see https://vercel.com/docs/drains/reference/logs
 */
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from 'redis'

// Force dynamic to prevent any caching or static behavior
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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

interface LogEntry {
  message: string
  timestamp: number
  requestId?: string
  statusCode?: number
  host?: string
  path?: string
  proxy?: {
    path?: string
    referer?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

/**
 * POST /api/drain
 *
 * Receives log entries from Vercel Log Drain and extracts referrer data.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const logs: LogEntry[] = Array.isArray(body) ? body : [body]

    const client = await getRedisClient()
    if (!client) {
      console.log('No Redis client, skipping drain processing')
      return NextResponse.json({ success: true, processed: 0 })
    }

    let processed = 0
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    for (const log of logs) {
      // Look for ref parameter in proxy.path (contains query params) or path
      const proxyPath = log.proxy?.path || ''
      const path = log.path || ''
      const refMatch = proxyPath.match(/[?&]ref=([^&\s]+)/) || path.match(/[?&]ref=([^&\s]+)/)

      if (refMatch) {
        const ref = refMatch[1].toLowerCase()
        // Increment daily count for this referrer
        await client.hIncrBy(`referrers:${today}`, ref, 1)
        // Increment all-time count
        await client.hIncrBy('referrers:total', ref, 1)
        processed++
      }
    }

    return NextResponse.json({ success: true, processed })
  } catch (error) {
    console.error('Drain processing error:', error)
    return NextResponse.json({ error: 'Failed to process drain' }, { status: 500 })
  }
}

/**
 * GET /api/drain
 *
 * Returns referrer statistics.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') // Optional: specific date YYYY-MM-DD

  try {
    const client = await getRedisClient()
    if (!client) {
      return NextResponse.json({ error: 'Redis not configured' }, { status: 500 })
    }

    if (date) {
      const stats = await client.hGetAll(`referrers:${date}`)
      return NextResponse.json({ date, referrers: stats })
    }

    const total = await client.hGetAll('referrers:total')
    return NextResponse.json({ referrers: total })
  } catch (error) {
    console.error('Drain stats error:', error)
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 })
  }
}
