import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirebaseAdminApp } from '@/firebase/server-init';

// Force the middleware to run on the Node.js runtime
export const runtime = 'nodejs';

async function verifySessionCookie(sessionCookie?: string): Promise<string | null> {
  if (!sessionCookie) return null;

  try {
    const app = getFirebaseAdminApp();
    const decodedClaims = await getAuth(app).verifySessionCookie(sessionCookie, true);
    return decodedClaims.uid;
  } catch (error) {
    console.error('Middleware: Session cookie verification failed', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session')?.value;

  const uid = await verifySessionCookie(sessionCookie);

  // If user is authenticated
  if (uid) {
    // If user is trying to access login page, redirect to dashboard
    if (pathname === '/login') {
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

  // Allow access to public pages (like /login)
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
