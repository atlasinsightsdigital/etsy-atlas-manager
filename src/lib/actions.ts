'use server';

import type { Order, CapitalEntry } from './definitions';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  FieldValue,
} from 'firebase-admin/firestore';
import { getFirestore } from '@/firebase/server-init';

// ---- INIT FIRESTORE ----
async function getDb() {
  return getFirestore();
}

// ---- ORDERS ----
export async function addOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();

  const orderDateTimestamp = order.orderDate
    ? Timestamp.fromDate(new Date(order.orderDate))
    : FieldValue.serverTimestamp();

  const newOrder = {
    ...order,
    orderDate: orderDateTimestamp,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  try {
    await db.collection('orders').add(newOrder);
  } catch (error) {
    console.error("Firestore 'addOrder' Error:", error);
    throw new Error('Error creating order.');
  }
}

export async function updateOrder(id: string, data: Partial<Omit<Order, 'id'>>) {
  const db = await getDb();
  const orderRef = db.collection('orders').doc(id);

  const updateData: any = {
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  };

  // Convert orderDate if present
  if (data.orderDate) {
    updateData.orderDate = Timestamp.fromDate(new Date(data.orderDate));
  }

  try {
    await orderRef.update(updateData);
  } catch (error) {
    console.error("Firestore 'updateOrder' Error:", error);
    throw new Error('Error updating order.');
  }
}

// ---- DELETE ORDER ----
export async function deleteOrder(id: string) {
  const db = await getDb();
  try {
    await db.collection('orders').doc(id).delete();
  } catch (error) {
    console.error('Error deleting order:', error);
    throw new Error('Failed to delete order.');
  }
}

// ---- CAPITAL ----
export async function addCapitalEntry(entry: Omit<CapitalEntry, 'id' | 'createdAt'>) {
  const db = await getDb();

  try {
    await db.collection('capital').add({
      ...entry,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error addCapitalEntry:', error);
    throw new Error('Unable to add capital entry.');
  }
}

export async function deleteCapitalEntry(id: string) {
  const db = await getDb();
  try {
    await db.collection('capital').doc(id).delete();
  } catch (error) {
    console.error('Error deleteCapitalEntry:', error);
    throw new Error('Unable to delete capital entry.');
  }
}
