'use server';

import type { Order, CapitalEntry } from './definitions';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  type Firestore,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// ORDER ACTIONS
export async function addOrder(firestore: Firestore, order: Omit<Order, 'id'>) {
  const newOrder = {
    ...order,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  try {
    await addDoc(collection(firestore, 'orders'), newOrder);
  } catch (error) {
    const permissionError = new FirestorePermissionError({
      path: 'orders',
      operation: 'create',
      requestResourceData: newOrder
    });
    errorEmitter.emit('permission-error', permissionError);
    console.error("Original error:", error); // Log original error for server-side inspection
    throw error; // Re-throw the error to be caught by the form's catch block
  }
}

export async function updateOrder(firestore: Firestore, id: string, data: Partial<Omit<Order, 'id'>>) {
  const orderRef = doc(firestore, 'orders', id);
  const updateData = {
    ...data,
    updatedAt: new Date(),
  };
  try {
    await updateDoc(orderRef, updateData);
  } catch (error) {
    const permissionError = new FirestorePermissionError({
      path: orderRef.path,
      operation: 'update',
      requestResourceData: updateData
    });
    errorEmitter.emit('permission-error', permissionError);
    console.error("Original error:", error);
    throw error;
  }
}

export async function deleteOrder(firestore: Firestore, id: string) {
  const orderRef = doc(firestore, 'orders', id);
  try {
    await deleteDoc(orderRef);
  } catch (error) {
    const permissionError = new FirestorePermissionError({
      path: orderRef.path,
      operation: 'delete',
    });
    errorEmitter.emit('permission-error', permissionError);
    console.error("Original error:", error);
    throw error;
  }
}

// CAPITAL ACTIONS
export async function addCapitalEntry(firestore: Firestore, entry: Omit<CapitalEntry, 'id' | 'createdAt'>) {
  const newEntry = {
    ...entry,
    createdAt: new Date(),
  };
  try {
    await addDoc(collection(firestore, 'capital'), newEntry);
  } catch (error) {
    const permissionError = new FirestorePermissionError({
      path: 'capital',
      operation: 'create',
      requestResourceData: newEntry
    });
    errorEmitter.emit('permission-error', permissionError);
    console.error("Original error:", error);
    throw error;
  }
}

export async function deleteCapitalEntry(firestore: Firestore, id: string) {
  const capitalRef = doc(firestore, 'capital', id);
  try {
    await deleteDoc(capitalRef);
  } catch (error) {
    const permissionError = new FirestorePermissionError({
      path: capitalRef.path,
      operation: 'delete',
    });
    errorEmitter.emit('permission-error', permissionError);
    console.error("Original error:", error);
    throw error;
  }
}

// SEED ACTION
export async function seedDatabase(firestore: Firestore) {
  // This function is intentionally left empty.
  console.log('Database seeding is not performed.');
  return Promise.resolve();
}
