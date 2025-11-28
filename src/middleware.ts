import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
// This is a mock middleware. In a real app, this would handle authentication.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}
 
export const config = {
  matcher: ['/dashboard/:path*'],
}
