'use server';

import type { Order, CapitalEntry, User } from './definitions';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  Firestore,
  Timestamp,
} from 'firebase/firestore';
import { getFirestore } from '@/firebase/server-init';
import { getAuth } from 'firebase-admin/auth';
import { getFirebaseAdminApp } from '@/firebase/server-init';

// --- Helper function to ensure Firestore is initialized ---
async function getDb(): Promise<Firestore> {
  // getFirestore() from server-init already handles initialization logic.
  return getFirestore();
}

// ORDER ACTIONS
export async function addOrder(order: Omit<Order, 'id'>) {
  const db = await getDb();
  const newOrder = {
    ...order,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  try {
    await addDoc(collection(db, 'orders'), newOrder);
  } catch (error) {
    console.error("Firestore 'addOrder' Error:", error);
    throw new Error('Failed to create order. Please check permissions and data.');
  }
}

export async function updateOrder(id: string, data: Partial<Omit<Order, 'id'>>) {
  const db = await getDb();
  const orderRef = doc(db, 'orders', id);
  const updateData = {
    ...data,
    updatedAt: Timestamp.now(),
  };
  try {
    await updateDoc(orderRef, updateData);
  } catch (error) {
    console.error("Firestore 'updateOrder' Error:", error);
    throw new Error('Failed to update order. Please check permissions and data.');
  }
}

export async function deleteOrder(id: string) {
  const db = await getDb();
  const orderRef = doc(db, 'orders', id);
  try {
    await deleteDoc(orderRef);
  } catch (error) {
    console.error("Firestore 'deleteOrder' Error:", error);
    throw new Error('Failed to delete order. Please check permissions.');
  }
}

// CAPITAL ACTIONS
export async function addCapitalEntry(entry: Omit<CapitalEntry, 'id' | 'createdAt'>) {
  const db = await getDb();
  const newEntry = {
    ...entry,
    createdAt: Timestamp.now(),
  };
  try {
    await addDoc(collection(db, 'capital'), newEntry);
  } catch (error) {
    console.error("Firestore 'addCapitalEntry' Error:", error);
    throw new Error('Failed to add capital entry. Please check permissions and data.');
  }
}

export async function deleteCapitalEntry(id: string) {
  const db = await getDb();
  const capitalRef = doc(db, 'capital', id);
  try {
    await deleteDoc(capitalRef);
  } catch (error) {
    console.error("Firestore 'deleteCapitalEntry' Error:", error);
    throw new Error('Failed to delete capital entry. Please check permissions.');
  }
}

// SEED ACTION
export async function seedDatabase() {
  console.log('Seeding process initiated...');
  try {
    const app = getFirebaseAdminApp();
    const auth = getAuth(app);
    const db = getFirestore();

    const userEmail = 'admin@etsyatlas.com';
    const userPassword = 'password';
    let userRecord;

    // Check if user already exists
    try {
      userRecord = await auth.getUserByEmail(userEmail);
      console.log(`User ${userEmail} already exists.`);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // User does not exist, create them
        userRecord = await auth.createUser({
          email: userEmail,
          password: userPassword,
          emailVerified: true,
          displayName: 'Admin User',
        });
        console.log(`Successfully created new user: ${userRecord.uid}`);
      } else {
        // Another error occurred
        throw error;
      }
    }

    // Now, create or update their profile in Firestore
    const userDocRef = doc(db, 'users', userRecord.uid);
    await setDoc(userDocRef, {
      name: 'Admin User',
      email: userEmail,
      role: 'admin',
      createdAt: Timestamp.now(),
      id: userRecord.uid
    }, { merge: true });

    console.log(`Admin user profile created/updated in Firestore for ${userEmail}.`);
    console.log('Seeding process completed successfully.');

  } catch (error) {
    console.error('Error during database seeding:', error);
    throw new Error('Failed to seed database. Check server logs for details.');
  }
}
