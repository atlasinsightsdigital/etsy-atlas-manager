'use server';

import type { Order, CapitalEntry } from './definitions';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { getFirestore } from '@/firebase/server-init';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// ---- INIT FIRESTORE ----
async function getDb() {
  return getFirestore();
}

// ---- ORDERS ----
export async function addOrder(order: Omit<Order, 'id'>) {
  const db = await getDb();
  const ordersCollection = collection(db, 'orders');

  const orderDateTimestamp = order.orderDate
    ? Timestamp.fromDate(new Date(order.orderDate))
    : serverTimestamp();

  const newOrder = {
    ...order,
    orderDate: orderDateTimestamp,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  addDoc(ordersCollection, newOrder).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: ordersCollection.path,
      operation: 'create',
      requestResourceData: newOrder,
    });
    console.error(permissionError.message); // Log server-side for now
    // In a real scenario, you might re-throw or handle it differently
    throw permissionError;
  });
}

export async function updateOrder(id: string, data: Partial<Omit<Order, 'id'>>) {
  const db = await getDb();
  const orderRef = doc(db, 'orders', id);

  const updateData: any = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  // Convert orderDate if present
  if (data.orderDate) {
    updateData.orderDate = Timestamp.fromDate(new Date(data.orderDate));
  }

  updateDoc(orderRef, updateData).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: orderRef.path,
      operation: 'update',
      requestResourceData: updateData,
    });
    console.error(permissionError.message); // Log server-side for now
    throw permissionError;
  });
}

// ---- DELETE ORDER ----
export async function deleteOrder(id: string) {
  const db = await getDb();
  const orderRef = doc(db, 'orders', id);
  deleteDoc(orderRef).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: orderRef.path,
      operation: 'delete',
    });
    console.error(permissionError.message); // Log server-side for now
    throw permissionError;
  });
}

// ---- CAPITAL ----
export async function addCapitalEntry(entry: Omit<CapitalEntry, 'id' | 'createdAt'>) {
  const db = await getDb();
  const capitalCollection = collection(db, 'capital');
  
  const newEntry = {
    ...entry,
    createdAt: serverTimestamp(),
  };

  addDoc(capitalCollection, newEntry).catch(
    async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: capitalCollection.path,
        operation: 'create',
        requestResourceData: newEntry,
      });
      console.error(permissionError.message);
      throw permissionError;
    }
  );
}

export async function deleteCapitalEntry(id: string) {
  const db = await getDb();
  const capitalRef = doc(db, 'capital', id);
  deleteDoc(capitalRef).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: capitalRef.path,
      operation: 'delete',
    });
    console.error(permissionError.message);
    throw permissionError;
  });
}
