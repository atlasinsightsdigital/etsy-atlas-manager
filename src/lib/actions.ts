'use server';

import type { Order, CapitalEntry } from './definitions';
import {
  collection,
  doc,
  writeBatch,
  serverTimestamp,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  type Firestore,
} from 'firebase/firestore';

// ORDER ACTIONS
export async function addOrder(firestore: Firestore, order: Omit<Order, 'id'>) {
  const newOrder = {
    ...order,
    // Use new Date() which Firestore will convert to a Timestamp
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  // Use the standard addDoc function and await its completion
  await addDoc(collection(firestore, 'orders'), newOrder);
}

export async function updateOrder(firestore: Firestore, id: string, data: Partial<Omit<Order, 'id'>>) {
  const orderRef = doc(firestore, 'orders', id);
  const updateData = {
    ...data,
    // Use new Date() for the update timestamp
    updatedAt: new Date(),
  };
  // Use the standard updateDoc function and await its completion
  await updateDoc(orderRef, updateData);
}

export async function deleteOrder(firestore: Firestore, id: string) {
  const orderRef = doc(firestore, 'orders', id);
  // Use the standard deleteDoc function and await its completion
  await deleteDoc(orderRef);
}

// CAPITAL ACTIONS
export async function addCapitalEntry(firestore: Firestore, entry: Omit<CapitalEntry, 'id' | 'createdAt'>) {
  const newEntry = {
    ...entry,
    // Use new Date() which Firestore will convert to a Timestamp
    createdAt: new Date(),
  };
  // Use the standard addDoc function and await its completion
  await addDoc(collection(firestore, 'capital'), newEntry);
}

export async function deleteCapitalEntry(firestore: Firestore, id: string) {
  const capitalRef = doc(firestore, 'capital', id);
  // Use the standard deleteDoc function and await its completion
  await deleteDoc(capitalRef);
}

// SEED ACTION
export async function seedDatabase(firestore: Firestore) {
  // This function is intentionally left empty to prevent seeding demo data.
  console.log('Database seeding has been disabled.');
  return Promise.resolve();
}
