'use server';

import type { Order, CapitalEntry, User } from './definitions';
import { users, orders, capitalEntries } from './data';
import {
  setDocumentNonBlocking,
  deleteDocumentNonBlocking,
  updateDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import { collection, doc, serverTimestamp, type Firestore, writeBatch } from 'firebase/firestore';

// ORDER ACTIONS
export async function addOrder(firestore: Firestore, order: Omit<Order, 'id'>) {
    const newDocRef = doc(collection(firestore, 'orders'));
    const newOrder = {
        ...order,
        id: newDocRef.id,
        createdAt: serverTimestamp(),
    };
    return setDocumentNonBlocking(newDocRef, newOrder, {});
}

export async function updateOrder(firestore: Firestore, order: Order) {
    const orderRef = doc(firestore, 'orders', order.id);
    const updateData = { ...order, updatedAt: serverTimestamp() };
    return updateDocumentNonBlocking(orderRef, updateData);
}

export async function deleteOrder(firestore: Firestore, id: string) {
    const orderRef = doc(firestore, 'orders', id);
    return deleteDocumentNonBlocking(orderRef);
}

// CAPITAL ACTIONS
export async function addCapitalEntry(firestore: Firestore, entry: Omit<CapitalEntry, 'id' | 'createdAt'>) {
    const newDocRef = doc(collection(firestore, 'capital'));
    const newEntry = {
        ...entry,
        id: newDocRef.id,
        createdAt: serverTimestamp(),
    };
    return setDocumentNonBlocking(newDocRef, newEntry, {});
}

export async function deleteCapitalEntry(firestore: Firestore, id: string) {
    const capitalRef = doc(firestore, 'capital', id);
    return deleteDocumentNonBlocking(capitalRef);
}

// SEED ACTION
export async function seedDatabase(firestore: Firestore) {
  const batch = writeBatch(firestore);

  // Seed Users
  users.forEach((user) => {
    const docRef = doc(firestore, 'users', user.id);
    const userData = { 
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: serverTimestamp() 
    };
    batch.set(docRef, userData);
  });

  // Seed Orders
  orders.forEach((order) => {
    const docRef = doc(firestore, 'orders', order.id);
    const orderData = { 
        id: order.id,
        etsyOrderId: order.etsyOrderId,
        orderDate: order.orderDate,
        status: order.status,
        orderPrice: order.orderPrice,
        orderCost: order.orderCost,
        shippingCost: order.shippingCost,
        additionalFees: order.additionalFees,
        notes: order.notes,
        trackingNumber: order.trackingNumber,
        createdAt: serverTimestamp()
    };
    batch.set(docRef, orderData);
  });

  // Seed Capital Entries
  capitalEntries.forEach((entry) => {
    const docRef = doc(firestore, 'capital', entry.id);
    const entryData = {
        id: entry.id,
        transactionDate: entry.transactionDate,
        type: entry.type,
        amount: entry.amount,
        source: entry.source,
        submittedBy: entry.submittedBy,
        notes: entry.notes,
        createdAt: serverTimestamp()
    };
    batch.set(docRef, entryData);
  });

  await batch.commit();
}
