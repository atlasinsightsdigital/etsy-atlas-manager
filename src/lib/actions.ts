'use server';

import type { Order, CapitalEntry, User } from './definitions';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  FieldValue,
  Timestamp,
  updateDoc,
} from 'firebase-admin/firestore';
import { getFirestore } from '@/firebase/server-init';
import { orders as seedOrders, users as seedUsers } from './data';

// ---- INIT FIRESTORE ----
async function getDb() {
  return getFirestore();
}

// ---- ORDERS ----
export async function addOrder(order: Omit<Order, 'id'>) {
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
    await doc(db, 'orders', id).delete();
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
    await doc(db, 'capital', id).delete();
  } catch (error) {
    console.error('Error deleteCapitalEntry:', error);
    throw new Error('Unable to delete capital entry.');
  }
}

// ---- SEEDING ----
export async function seedDatabase() {
  const db = await getDb();
  try {
    // Seed Users
    const usersCollection = collection(db, 'users');
    for (const user of seedUsers) {
      // In a real app, you would check for existence or use a unique ID from auth
      await addDoc(usersCollection, {
        ...user,
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    // Seed Orders
    const ordersCollection = collection(db, 'orders');
    for (const order of seedOrders) {
      await addDoc(ordersCollection, {
        ...order,
        orderDate: Timestamp.fromDate(new Date()), // Use a consistent date for seeds
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    return { success: true, message: 'Database seeded successfully!' };
  } catch (error) {
    console.error('Error seeding database:', error);
    // Return a serializable error object
    return { success: false, message: 'Failed to seed database.' };
  }
}
