'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// Define a type for the config for clarity
type FirebaseConfig = {
  [key: string]: string | undefined;
};

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase(config: FirebaseConfig) {
  // Check if any apps are already initialized
  if (getApps().length) {
    return getSdks(getApp());
  }

  // Initialize the app with the provided config
  const firebaseApp = initializeApp(config);
  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

// Export providers
export { FirebaseClientProvider } from './client-provider';

// Export utilities
export { FirestorePermissionError } from './errors';
export { errorEmitter } from './error-emitter';
