
'use server';

import { users as mockUsers, orders as mockOrders, capitalEntries as mockCapitalEntries } from '@/lib/data';
import type { Order, User, CapitalEntry } from './definitions';

// Data is stored in memory and reset on server restart.
// In a real application, this would be a database.
let orders: Order[] = [...mockOrders];
let users: User[] = [...mockUsers];
let capitalEntries: CapitalEntry[] = [...mockCapitalEntries];


// USER ACTIONS
export async function getUsers() {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return users;
}

// ORDER ACTIONS
export async function getOrders() {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return orders;
}

export async function addOrder(order: Omit<Order, 'id'>) {
    const newId = (Math.max(...orders.map(o => parseInt(o.id)), 0) + 1).toString();
    const newOrder: Order = { ...order, id: newId };
    orders.unshift(newOrder); // Add to the beginning of the array
    return newOrder;
}

export async function updateOrder(order: Order) {
    const index = orders.findIndex(o => o.id === order.id);
    if (index !== -1) {
        orders[index] = order;
        return order;
    }
    return null;
}

export async function deleteOrder(id: string) {
    orders = orders.filter(o => o.id !== id);
    return { success: true };
}

// CAPITAL ACTIONS
export async function getCapitalEntries() {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return capitalEntries;
}

export async function addCapitalEntry(entry: Omit<CapitalEntry, 'id' | 'createdAt' | 'locked'>) {
    const newId = (Math.max(...capitalEntries.map(e => parseInt(e.id)), 0) + 1).toString();
    const newEntry: CapitalEntry = { 
      ...entry, 
      id: newId,
      createdAt: new Date().toISOString(),
      locked: true
    };
    capitalEntries.unshift(newEntry);
    return newEntry;
}

export async function deleteCapitalEntry(id: string) {
    capitalEntries = capitalEntries.filter(e => e.id !== id && !e.locked);
    return { success: true };
}
