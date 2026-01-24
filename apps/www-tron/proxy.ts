import { NextResponse, type NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get('ref')
  const existingRefCookie = request.cookies.get('ref')?.value

  const response = NextResponse.next()

  // Parse existing cookie if present
  let existingRef: { ref: string; ts: number } | null = null
  if (existingRefCookie) {
    try {
      existingRef = JSON.parse(existingRefCookie)
    } catch {}
  }

  if (ref && !existingRef) {
    // First touch: store ref with timestamp
    const refData = { ref, ts: Date.now() }
    response.cookies.set('ref', JSON.stringify(refData), {
      maxAge: 60 * 60 * 24 * 90, // 90 days
      path: '/',
    })

    // Log first touch
    fetch(`${request.nextUrl.origin}/api/drain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{
        proxy: { path: request.nextUrl.pathname + request.nextUrl.search },
        type: 'first_touch'
      }]),
    }).catch(() => {})
  } else if (existingRef) {
    // Return visit: log that referred user came back
    fetch(`${request.nextUrl.origin}/api/drain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{
        proxy: { path: `/?ref=${existingRef.ref}` },
        type: 'return_visit',
        originalTs: existingRef.ts
      }]),
    }).catch(() => {})
  }

  return response
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}
