'use server';

import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getFirestore as getFirestoreAdmin, Firestore } from 'firebase-admin/firestore';
import { firebaseConfig } from '@/firebase/config';

// This is a singleton pattern to ensure we only initialize the app once.
let adminApp: App;

function initializeAdminApp() {
  if (getApps().some(app => app.name === 'admin')) {
    return getApp('admin');
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined;

  if (serviceAccount) {
    return initializeApp({
      credential: cert(serviceAccount),
      projectId: firebaseConfig.projectId,
    }, 'admin');
  }

  // Fallback for environments where service account isn't set via env var
  // (like local or some CI/CD) but might have Application Default Credentials.
  return initializeApp({
    projectId: firebaseConfig.projectId,
  }, 'admin');
}

function getAdminApp(): App {
  if (!adminApp) {
    adminApp = initializeAdminApp();
  }
  return adminApp;
}

export function getFirebaseAdminApp(): App {
  return getAdminApp();
}

export function getFirestore(): Firestore {
  // Always get the firestore instance from the initialized admin app
  return getFirestoreAdmin(getAdminApp());
}
