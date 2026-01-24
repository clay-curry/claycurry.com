import { NextResponse, type NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get('ref')
  const existingRef = request.cookies.get('ref')?.value

  const response = NextResponse.next()

  if (ref && !existingRef) {
    // First touch: store ref with timestamp
    const refData = JSON.stringify({ ref, ts: Date.now() })
    response.cookies.set('ref', refData, {
      maxAge: 60 * 60 * 24 * 90, // 90 days
      path: '/',
    })

    // Fire-and-forget POST to track immediately
    fetch(`${request.nextUrl.origin}/api/drain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ proxy: { path: request.nextUrl.pathname + request.nextUrl.search } }]),
    }).catch(() => {})
  }

  return response
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}
