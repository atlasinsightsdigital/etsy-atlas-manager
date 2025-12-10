import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getAdminApp } from '@/lib/admin';

// Cookie configuration
const SESSION_COOKIE_NAME = 'session';
const SESSION_EXPIRES_IN_DAYS = 5;
const SESSION_MAX_AGE = SESSION_EXPIRES_IN_DAYS * 24 * 60 * 60; // in seconds
const SESSION_EXPIRES_IN_MS = SESSION_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000;

// Check environment
const isProduction = process.env.NODE_ENV === 'production';

/**
 * POST /api/auth/session
 * Create a new session from Firebase ID token
 */
export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('Authorization');
    
    // Validate Authorization header
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing or invalid Authorization header. Use format: Bearer <token>',
          code: 'MISSING_AUTH_HEADER'
        },
        { status: 401 }
      );
    }
    
    const idToken = authorization.substring(7); // Remove 'Bearer ' prefix
    
    if (!idToken || idToken.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID token is empty',
          code: 'EMPTY_TOKEN'
        },
        { status: 401 }
      );
    }

    // Get Firebase Admin app instance
    const app = await getAdminApp();
    
    // Create session cookie
    const sessionCookie = await getAuth(app).createSessionCookie(idToken, { 
      expiresIn: SESSION_EXPIRES_IN_MS 
    });
    
    // Create success response
    const response = NextResponse.json({
      success: true,
      message: 'Session created successfully',
      expiresIn: SESSION_MAX_AGE
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionCookie,
      maxAge: SESSION_MAX_AGE,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('Session creation failed:', error);
    
    // Provide user-friendly error messages
    let errorMessage = 'Authentication failed';
    let errorCode = 'AUTH_FAILED';
    let statusCode = 401;

    // Handle Firebase Auth errors
    if (error.code) {
      switch (error.code) {
        case 'auth/id-token-expired':
          errorMessage = 'Your session has expired. Please sign in again.';
          errorCode = 'TOKEN_EXPIRED';
          break;
        case 'auth/id-token-revoked':
          errorMessage = 'Your session has been revoked.';
          errorCode = 'TOKEN_REVOKED';
          break;
        case 'auth/invalid-id-token':
          errorMessage = 'Invalid authentication token.';
          errorCode = 'INVALID_TOKEN';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Your account has been disabled.';
          errorCode = 'USER_DISABLED';
          statusCode = 403;
          break;
        case 'auth/user-not-found':
          errorMessage = 'User account not found.';
          errorCode = 'USER_NOT_FOUND';
          break;
        default:
          // Check for generic error patterns
          if (error.message?.includes('service account') || 
              error.message?.includes('credential') ||
              error.code?.includes('app/no-app')) {
            errorMessage = 'Server configuration error. Please contact support.';
            errorCode = 'SERVER_CONFIG_ERROR';
            statusCode = 500;
          }
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        code: errorCode,
        details: isProduction ? undefined : error.message
      },
      { status: statusCode }
    );
  }
}

/**
 * GET /api/auth/session
 * Verify and return current session information
 */
export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    
    if (!sessionCookie) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No active session found',
          code: 'NO_SESSION',
          authenticated: false
        },
        { status: 401 }
      );
    }

    // Get Firebase Admin app instance
    const app = await getAdminApp();
    
    // Verify the session cookie
    const decodedClaims = await getAuth(app).verifySessionCookie(sessionCookie, true);
    
    // Return user information
    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
        emailVerified: decodedClaims.email_verified || false,
        name: decodedClaims.name || undefined,
        picture: decodedClaims.picture || undefined,
      },
      expiresAt: new Date(decodedClaims.exp * 1000).toISOString()
    });

  } catch (error: any) {
    console.error('Session verification failed:', error);
    
    // Clear invalid cookie
    const response = NextResponse.json(
      { 
        success: false, 
        error: 'Invalid or expired session',
        code: 'INVALID_SESSION',
        authenticated: false,
        details: isProduction ? undefined : error.message
      },
      { status: 401 }
    );

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      maxAge: -1,
      path: '/',
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
    });

    return response;
  }
}

/**
 * DELETE /api/auth/session
 * Sign out and clear session cookie
 */
export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: 'Signed out successfully'
  });

  // Clear the session cookie
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    maxAge: -1,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
  });

  return response;
}

/**
 * PATCH /api/auth/session
 * Refresh session (optional)
 */
export async function PATCH(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    
    if (!sessionCookie) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No active session to refresh',
          code: 'NO_SESSION'
        },
        { status: 401 }
      );
    }

    // Get Firebase Admin app instance
    const app = await getAdminApp();
    
    // Verify current session first
    const decodedClaims = await getAuth(app).verifySessionCookie(sessionCookie, true);
    
    // Create new session cookie with extended expiration
    // Note: Firebase doesn't have a "refresh token" for session cookies,
    // so we need to get a new ID token from the client and create a new session cookie
    // For now, we'll just return the current session info
    const response = NextResponse.json({
      success: true,
      message: 'Session is valid',
      user: {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
      },
      expiresAt: new Date(decodedClaims.exp * 1000).toISOString()
    });

    // You could optionally extend the cookie expiration here
    // by setting it again with the same value
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionCookie,
      maxAge: SESSION_MAX_AGE,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Session refresh failed:', error);
    
    // Clear invalid cookie on error
    const response = NextResponse.json(
      { 
        success: false, 
        error: 'Failed to refresh session',
        code: 'REFRESH_FAILED',
        details: isProduction ? undefined : error.message
      },
      { status: 401 }
    );

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      maxAge: -1,
      path: '/',
    });

    return response;
  }
}
