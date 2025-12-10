'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    // Force initialization with the config object to fix client-side errors
    const firebaseApp = initializeApp(firebaseConfig);
    return getSdks(firebaseApp);
  }

  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

// Export hooks - ONLY export what exists
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';

// Export providers
export { FirebaseClientProvider } from './client-provider';

// Export utilities
export { FirestorePermissionError } from './errors';
export { errorEmitter } from './error-emitter';

// Helper function to get firestore
export function getFirestoreInstance() {
  const { firestore } = initializeFirebase();
  return firestore;
}

// Helper function to get auth
export function getAuthInstance() {
  const { auth } = initializeFirebase();
  return auth;
}

// Simple hooks
export function useFirestore() {
  const { firestore } = initializeFirebase();
  return firestore;
}

export function useAuth() {
  const { auth } = initializeFirebase();
  return auth;
}
