'use server';

import type { Order, CapitalEntry } from './definitions';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { getFirestore } from '@/firebase/server-init';

// ORDER ACTIONS
export async function addOrder(order: Omit<Order, 'id'>) {
  const firestore = getFirestore();
  const newOrder = {
    ...order,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  try {
    await addDoc(collection(firestore, 'orders'), newOrder);
  } catch (error) {
    // Note: errorEmitter will not work in Server Actions as it's a client-side mechanism.
    // The error is thrown to be caught by the form's state management.
    console.error("Firestore 'addOrder' Error:", error);
    throw new Error('Failed to create order. Please check permissions and data.');
  }
}

export async function updateOrder(id: string, data: Partial<Omit<Order, 'id'>>) {
  const firestore = getFirestore();
  const orderRef = doc(firestore, 'orders', id);
  const updateData = {
    ...data,
    updatedAt: new Date(),
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
    createdAt: new Date(),
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
  const firestore = getFirestore();
  // This function is intentionally left empty.
  console.log('Database seeding is not performed.');
  return Promise.resolve();
}