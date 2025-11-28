
import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getFirestore as getFirestoreAdmin, Firestore } from 'firebase-admin/firestore';
import { firebaseConfig } from '@/firebase/config';

// This file is for SERVER-SIDE initialization only.

let app: App;
let firestore: Firestore;

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

if (!getApps().length) {
  if (serviceAccount) {
    // Production/Vercel environment with service account
    app = initializeApp({
      credential: cert(serviceAccount),
      projectId: firebaseConfig.projectId,
    });
  } else {
    // Local development - re-uses client-side config but with admin privileges.
    // Ensure FIREBASE_AUTH_EMULATOR_HOST is set in your .env.local file
    // for this to work correctly with emulators.
    console.log("Initializing Firebase Admin SDK for local development. Make sure emulators are running.");
    app = initializeApp({
        projectId: firebaseConfig.projectId
    });
  }
} else {
  app = getApp();
}

firestore = getFirestoreAdmin(app);

export function getFirestore() {
  return firestore;
}
