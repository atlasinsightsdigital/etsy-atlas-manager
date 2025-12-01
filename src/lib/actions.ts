'use server';

import type { Order, CapitalEntry, User } from './definitions';
import {
  FieldValue,
  Timestamp,
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
    await db.collection('orders').add(newOrder);
  } catch (error) {
    console.error("Firestore 'addOrder' Error:", error);
    throw new Error('Error creating order.');
  }
}

export async function updateOrder(id: string, data: Partial<Omit<Order, 'id'>>) {
  const db = await getDb();
  const orderRef = db.doc(`orders/${id}`);

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
    await db.doc(`orders/${id}`).delete();
  } catch (error) {
    console.error('Error deleting order:', error);
    throw new Error('Failed to delete order.');
  }
}

// ---- CAPITAL ----
export async function addCapitalEntry(entry: Omit<CapitalEntry, 'id' | 'createdAt'>) {
  const db = await getDb();
  const transactionDateTimestamp = entry.transactionDate
    ? Timestamp.fromDate(new Date(entry.transactionDate))
    : FieldValue.serverTimestamp();

  try {
    await db.collection('capital').add({
      ...entry,
      transactionDate: transactionDateTimestamp,
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
    await db.doc(`capital/${id}`).delete();
  } catch (error) {
    console.error('Error deleteCapitalEntry:', error);
    throw new Error('Unable to delete capital entry.');
  }
}

// ---- SEEDING ----
export async function seedDatabase() {
  const db = await getDb();
  const batch = db.batch();

  try {
    // Seed Users
    const usersCollection = db.collection('users');
    seedUsers.forEach(user => {
      const docRef = usersCollection.doc(); // Auto-generate ID
      batch.set(docRef, {
        ...user,
        createdAt: FieldValue.serverTimestamp(),
      });
    });

    // Seed Orders
    const ordersCollection = db.collection('orders');
    seedOrders.forEach(order => {
      const docRef = ordersCollection.doc(); // Auto-generate ID
      batch.set(docRef, {
        ...order,
        orderDate: Timestamp.fromDate(new Date()), // Use a consistent date for seeds
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
    
    return { success: true, message: 'Database seeded successfully!' };
  } catch (error) {
    console.error('Error seeding database:', error);
    // Return a serializable error object
    return { success: false, message: 'Failed to seed database.' };
  }
}
