import { NextResponse, type NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirebaseAdminApp } from '@/firebase/server-init';

export async function POST(request: NextRequest) {
  const authorization = request.headers.get('Authorization');
  if (authorization?.startsWith('Bearer ')) {
    const idToken = authorization.split('Bearer ')[1];
    
    try {
      const app = getFirebaseAdminApp();
      // Set session expiration to 5 days.
      const expiresIn = 60 * 60 * 24 * 5 * 1000;
      const sessionCookie = await getAuth(app).createSessionCookie(idToken, { expiresIn });
      
      const options = {
        name: 'session',
        value: sessionCookie,
        maxAge: expiresIn,
        httpOnly: true,
        secure: true,
      };

      const response = NextResponse.json({ status: 'success' });
      response.cookies.set(options);
      return response;

    } catch (error) {
      console.error('Session cookie creation failed:', error);
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
}

export async function DELETE() {
  const response = NextResponse.json({ status: 'success' });
  response.cookies.set({
    name: 'session',
    value: '',
    maxAge: -1, // Expire the cookie immediately
  });
  return response;
}
