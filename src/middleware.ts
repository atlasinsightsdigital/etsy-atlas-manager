
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Force the middleware to run on the Node.js runtime for compatibility, 
// even though we removed heavy dependencies.
export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session')?.value;

  const isAuthenticated = !!sessionCookie;

  // If user is authenticated
  if (isAuthenticated) {
    // If user is trying to access login page, redirect to dashboard
    if (pathname === '/login' || pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Allow access to other pages
    return NextResponse.next();
  }

  // If user is not authenticated
  // and trying to access a protected route, redirect to login
  if (pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('continue', pathname); // Optional: preserve original destination
    return NextResponse.redirect(loginUrl);
  }

  // Allow access to public pages (like /login or the root page if it becomes public)
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/'],
};
