import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware that ensures every incoming request has a unique `x-request-id` header.
 * If the client already provides one, it is preserved; otherwise a new UUID is generated.
 * The header is attached to the request (so server components / API routes can read it)
 * and also added to the response for visibility in logs and client debugging.
 */
export function middleware(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', requestId);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('x-request-id', requestId);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
