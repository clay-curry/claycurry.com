import { NextResponse, type NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get('ref')

  if (ref) {
    // Fire-and-forget POST to track immediately
    fetch(`${request.nextUrl.origin}/api/drain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ proxy: { path: request.nextUrl.pathname + request.nextUrl.search } }]),
    }).catch(() => {})
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}
