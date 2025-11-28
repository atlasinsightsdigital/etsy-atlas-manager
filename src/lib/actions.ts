'use server';

import type { Order, CapitalEntry } from './definitions';
import {
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
  updateDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import { collection, doc, serverTimestamp, type Firestore } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

// ORDER ACTIONS
export async function addOrder(firestore: Firestore, order: Omit<Order, 'id'>) {
    const ordersCollection = collection(firestore, 'orders');
    const newOrder = {
        ...order,
        id: uuidv4(),
        createdAt: serverTimestamp(),
    };
    return addDocumentNonBlocking(ordersCollection, newOrder);
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
    const capitalCollection = collection(firestore, 'capital');
    const newEntry = {
        ...entry,
        id: uuidv4(),
        createdAt: serverTimestamp(),
    };
    return addDocumentNonBlocking(capitalCollection, newEntry);
}

export async function deleteCapitalEntry(firestore: Firestore, id: string) {
    const capitalRef = doc(firestore, 'capital', id);
    return deleteDocumentNonBlocking(capitalRef);
}
