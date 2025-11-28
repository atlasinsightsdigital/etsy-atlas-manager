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
  addDoc(collection(firestore, 'orders'), newOrder)
    .catch((error) => {
        const permissionError = new FirestorePermissionError({
            path: 'orders',
            operation: 'create',
            requestResourceData: newOrder
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error("Original error:", error); // Log original error for server-side inspection
    });
}

export async function updateOrder(firestore: Firestore, id: string, data: Partial<Omit<Order, 'id'>>) {
  const orderRef = doc(firestore, 'orders', id);
  const updateData = {
    ...data,
    updatedAt: new Date(),
  };
  updateDoc(orderRef, updateData)
    .catch((error) => {
        const permissionError = new FirestorePermissionError({
            path: orderRef.path,
            operation: 'update',
            requestResourceData: updateData
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error("Original error:", error);
    });
}

export async function deleteOrder(firestore: Firestore, id: string) {
  const orderRef = doc(firestore, 'orders', id);
  deleteDoc(orderRef)
    .catch((error) => {
        const permissionError = new FirestorePermissionError({
            path: orderRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error("Original error:", error);
    });
}

// CAPITAL ACTIONS
export async function addCapitalEntry(firestore: Firestore, entry: Omit<CapitalEntry, 'id' | 'createdAt'>) {
  const newEntry = {
    ...entry,
    createdAt: new Date(),
  };
  addDoc(collection(firestore, 'capital'), newEntry)
    .catch((error) => {
        const permissionError = new FirestorePermissionError({
            path: 'capital',
            operation: 'create',
            requestResourceData: newEntry
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error("Original error:", error);
    });
}

export async function deleteCapitalEntry(firestore: Firestore, id: string) {
  const capitalRef = doc(firestore, 'capital', id);
  deleteDoc(capitalRef)
    .catch((error) => {
        const permissionError = new FirestorePermissionError({
            path: capitalRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error("Original error:", error);
    });
}

// SEED ACTION
export async function seedDatabase(firestore: Firestore) {
  // This function is intentionally left empty.
  console.log('Database seeding is not performed.');
  return Promise.resolve();
}
