import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getFirestore as getFirestoreAdmin, Firestore } from 'firebase-admin/firestore';
import { firebaseConfig } from '@/firebase/config';

// Ce fichier est pour l'initialisation CÔTÉ SERVEUR uniquement.

let app: App;
let firestore: Firestore;

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

if (!getApps().length) {
  if (serviceAccount) {
    // Environnement de production avec un compte de service
    app = initializeApp({
      credential: cert(serviceAccount),
      projectId: firebaseConfig.projectId,
    });
  } else {
    // Environnement local ou un environnement où le compte de service n'est pas défini.
    // L'initialisation avec seulement le projectId est suffisante pour de nombreux cas d'utilisation côté serveur
    // lorsque les variables d'environnement par défaut de Google Cloud sont présentes.
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
