'use server';

import type { Order, CapitalEntry, User } from './definitions';
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
    // Ensure date is in a format Firestore understands if it's coming from a form.
    // The form sends it as a 'yyyy-mm-dd' string. Firestore can handle this.
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
  
  // No data to seed
  
  await batch.commit();
}
