'use server';

import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getFirestore as getFirestoreAdmin, Firestore } from 'firebase-admin/firestore';
import { firebaseConfig } from '@/firebase/config';

// Keep a global reference so Firebase Admin is initialized only once
let adminApp: App | undefined;

// Initialize Admin SDK (singleton)
async function initializeAdminApp(): Promise<App> {
  // If already initialized → return existing app
  const existing = getApps().find(app => app.name === 'admin');
  if (existing) return existing;

  // Check if SERVICE ACCOUNT is set via environment variable
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined;

  // Case 1: Using service account JSON (production recommended)
  if (serviceAccount) {
    return initializeApp(
      {
        credential: cert(serviceAccount),
        projectId: firebaseConfig.projectId,
      },
      'admin'
    );
  }

  // Case 2: Use default credentials (local dev, CI/CD, etc.)
  return initializeApp(
    {
      projectId: firebaseConfig.projectId,
    },
    'admin'
  );
}

// Get or create the Admin app
async function getAdminApp(): Promise<App> {
  if (!adminApp) {
    adminApp = await initializeAdminApp();
  }
  return adminApp;
}

// Exported functions must be async for Next.js Server Actions
export async function getFirebaseAdminApp(): Promise<App> {
  return await getAdminApp();
}

export async function getFirestore(): Promise<Firestore> {
  const app = await getAdminApp();
  return getFirestoreAdmin(app);
}
