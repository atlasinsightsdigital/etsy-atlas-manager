'use server';

import type { Order, CapitalEntry } from './definitions';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { getFirestore } from '@/firebase/server-init';

// ---- INIT FIRESTORE ----
async function getDb() {
  return getFirestore();
}

// ---- ORDERS ----
export async function addOrder(order: Omit<Order, 'id'>) {
  const db = await getDb();

  const orderDateTimestamp = order.orderDate
    ? Timestamp.fromDate(new Date(order.orderDate))
    : serverTimestamp();

  const newOrder = {
    ...order,
    orderDate: orderDateTimestamp,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await addDoc(collection(db, 'orders'), newOrder);
  } catch (error) {
    console.error("Firestore 'addOrder' Error:", error);
    throw new Error('Error creating order.');
  }
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

  try {
    await updateDoc(orderRef, updateData);
  } catch (error) {
    console.error("Firestore 'updateOrder' Error:", error);
    throw new Error('Error updating order.');
  }
}

// ---- DELETE ORDER ----
export async function deleteOrder(id: string) {
  const db = await getDb();
  try {
    await deleteDoc(doc(db, 'orders', id));
  } catch (error) {
    console.error('Error deleting order:', error);
    throw new Error('Failed to delete order.');
  }
}

// ---- CAPITAL ----
export async function addCapitalEntry(entry: Omit<CapitalEntry, 'id' | 'createdAt'>) {
  const db = await getDb();

  try {
    await addDoc(collection(db, 'capital'), {
      ...entry,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error addCapitalEntry:', error);
    throw new Error('Unable to add capital entry.');
  }
}

export async function deleteCapitalEntry(id: string) {
  const db = await getDb();
  try {
    await deleteDoc(doc(db, 'capital', id));
  } catch (error) {
    console.error('Error deleteCapitalEntry:', error);
    throw new Error('Unable to delete capital entry.');
  }
}
