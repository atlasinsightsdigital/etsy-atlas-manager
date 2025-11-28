import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getFirestore as getFirestoreAdmin, Firestore } from 'firebase-admin/firestore';
import { firebaseConfig } from '@/firebase/config';

let app: App;
let firestore: Firestore;

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

function initializeAdminApp() {
  if (getApps().some(app => app.name === 'admin')) {
    return getApp('admin');
  }

  if (serviceAccount) {
    return initializeApp({
      credential: cert(serviceAccount),
      projectId: firebaseConfig.projectId,
    }, 'admin');
  }

  // Fallback for environments where service account isn't set via env var
  // (like local or some CI/CD) but might have Application Default Credentials.
  return initializeApp({
      projectId: firebaseConfig.projectId
  }, 'admin');
}

app = initializeAdminApp();
firestore = getFirestoreAdmin(app);

export function getFirebaseAdminApp() {
  return app;
}

export function getFirestore() {
  return firestore;
}