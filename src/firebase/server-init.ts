import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getFirestore as getFirestoreAdmin, Firestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

// Singleton Firebase Admin App instance
let adminApp: App | undefined;

// Configuration interface
interface FirebaseAdminConfig {
  projectId: string;
  storageBucket?: string;
}

// Get Firebase Admin configuration from environment variables
function getFirebaseAdminConfig(): FirebaseAdminConfig {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 
                    process.env.FIREBASE_PROJECT_ID;
  
  if (!projectId) {
    throw new Error('Missing Firebase project ID. Set NEXT_PUBLIC_FIREBASE_PROJECT_ID or FIREBASE_PROJECT_ID environment variable.');
  }

  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 
                        process.env.FIREBASE_STORAGE_BUCKET;

  return {
    projectId,
    storageBucket: storageBucket || `${projectId}.appspot.com`
  };
}

// Parse service account from environment variable
function parseServiceAccount() {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  if (!serviceAccountJson) {
    console.warn('FIREBASE_SERVICE_ACCOUNT not set. Using default application credentials.');
    return null;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    // Validate required service account fields
    const requiredFields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email'];
    for (const field of requiredFields) {
      if (!serviceAccount[field]) {
        throw new Error(`Service account missing required field: ${field}`);
      }
    }
    
    return serviceAccount;
  } catch (error) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', error);
    throw new Error('Invalid service account JSON in FIREBASE_SERVICE_ACCOUNT environment variable.');
  }
}

// Initialize Firebase Admin App (singleton)
async function initializeAdminApp(): Promise<App> {
  try {
    // Return existing app if already initialized
    const existing = getApps().find(app => app.name === 'admin');
    if (existing) {
      return existing;
    }

    const config = getFirebaseAdminConfig();
    const serviceAccount = parseServiceAccount();

    // Initialize with service account if available
    if (serviceAccount) {
      return initializeApp({
        credential: cert(serviceAccount),
        projectId: config.projectId,
        storageBucket: config.storageBucket,
      }, 'admin');
    }

    // Initialize with default credentials (for environments like Cloud Run, App Engine, etc.)
    console.log('Using default application credentials.');
    return initializeApp({
      projectId: config.projectId,
      storageBucket: config.storageBucket,
    }, 'admin');

  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
}

// Get or create the Admin app instance
async function getAdminApp(): Promise<App> {
  if (!adminApp) {
    adminApp = await initializeAdminApp();
  }
  return adminApp;
}

// Public API for getting Firebase Admin App
export async function getFirebaseAdminApp(): Promise<App> {
  return getAdminApp();
}

// Public API for getting Firestore instance
export async function getFirestore(): Promise<Firestore> {
  const app = await getAdminApp();
  return getFirestoreAdmin(app);
}

// Public API for getting Auth instance
export async function getAuthInstance() {
  const app = await getAdminApp();
  return getAuth(app);
}

// Public API for getting Storage instance
export async function getStorageInstance() {
  const app = await getAdminApp();
  return getStorage(app);
}

// Helper function to verify ID tokens
export async function verifyIdToken(idToken: string) {
  try {
    const auth = await getAuthInstance();
    return await auth.verifyIdToken(idToken, true);
  } catch (error) {
    console.error('Failed to verify ID token:', error);
    throw error;
  }
}

// Helper function to verify session cookies
export async function verifySessionCookie(sessionCookie: string) {
  try {
    const auth = await getAuthInstance();
    return await auth.verifySessionCookie(sessionCookie, true);
  } catch (error) {
    console.error('Failed to verify session cookie:', error);
    throw error;
  }
}

// Helper function to create a session cookie from ID token
export async function createSessionCookie(idToken: string, expiresIn: number = 60 * 60 * 24 * 5 * 1000) {
  try {
    const auth = await getAuthInstance();
    return await auth.createSessionCookie(idToken, { expiresIn });
  } catch (error) {
    console.error('Failed to create session cookie:', error);
    throw error;
  }
}

// Optional: Cleanup function (useful for testing)
export async function cleanup() {
  if (adminApp) {
    // Note: Firebase Admin doesn't have a cleanup method
    // This is mostly for testing purposes
    adminApp = undefined;
  }
}