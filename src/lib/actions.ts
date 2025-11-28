'use server';

import type { Order, CapitalEntry, User } from './definitions';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
} from 'firebase/firestore';
import { getFirestore } from '@/firebase/server-init';
import { getAuth } from 'firebase-admin/auth';
import { Timestamp } from 'firebase/firestore';

// ORDER ACTIONS
export async function addOrder(order: Omit<Order, 'id'>) {
  const firestore = getFirestore();
  const newOrder = {
    ...order,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  try {
    await addDoc(collection(firestore, 'orders'), newOrder);
  } catch (error) {
    console.error("Firestore 'addOrder' Error:", error);
    throw new Error('Failed to create order. Please check permissions and data.');
  }
}

export async function updateOrder(id: string, data: Partial<Omit<Order, 'id'>>) {
  const firestore = getFirestore();
  const orderRef = doc(firestore, 'orders', id);
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
  const firestore = getFirestore();
  const orderRef = doc(firestore, 'orders', id);
  try {
    await deleteDoc(orderRef);
  } catch (error) {
    console.error("Firestore 'deleteOrder' Error:", error);
    throw new Error('Failed to delete order. Please check permissions.');
  }
}

// CAPITAL ACTIONS
export async function addCapitalEntry(entry: Omit<CapitalEntry, 'id' | 'createdAt'>) {
  const firestore = getFirestore();
  const newEntry = {
    ...entry,
    createdAt: Timestamp.now(),
  };
  try {
    await addDoc(collection(firestore, 'capital'), newEntry);
  } catch (error) {
    console.error("Firestore 'addCapitalEntry' Error:", error);
    throw new Error('Failed to add capital entry. Please check permissions and data.');
  }
}

export async function deleteCapitalEntry(id: string) {
  const firestore = getFirestore();
  const capitalRef = doc(firestore, 'capital', id);
  try {
    await deleteDoc(capitalRef);
  } catch (error) {
    console.error("Firestore 'deleteCapitalEntry' Error:", error);
    throw new Error('Failed to delete capital entry. Please check permissions.');
  }
}

// SEED ACTION
export async function seedDatabase() {
  console.log('Seeding process initiated. Note: User creation with password is disabled.');
  // The logic for creating a user with a password has been removed to enforce Google-only sign-in.
  // Admin roles must now be assigned manually in the Firebase console or through a dedicated admin interface.
}
