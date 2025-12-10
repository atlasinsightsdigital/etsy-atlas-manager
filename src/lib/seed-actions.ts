'use server';

import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { getFirestore } from '@/firebase/server-init';
import { orders as seedOrders, users as seedUsers } from './data';

export async function seedDatabase() {
  try {
    const db = await getFirestore();
    
    // Check if we already have data
    const [ordersSnapshot, usersSnapshot] = await Promise.all([
      db.collection('orders').get(),
      db.collection('users').get(),
    ]);

    // Only seed if collections are empty
    if (ordersSnapshot.size > 0 || usersSnapshot.size > 0) {
      return { 
        success: false, 
        message: 'Database already contains data. Please clear existing data first.' 
      };
    }

    // Create a new batch
    const batch = db.batch();

    // Seed Users
    const usersCollection = db.collection('users');
    seedUsers.forEach(user => {
      const docRef = usersCollection.doc();
      batch.set(docRef, {
        ...user,
        createdAt: FieldValue.serverTimestamp(),
      });
    });

    // Seed Orders
    const ordersCollection = db.collection('orders');
    seedOrders.forEach(order => {
      const docRef = ordersCollection.doc();
      batch.set(docRef, {
        ...order,
        orderDate: Timestamp.fromDate(new Date(order.orderDate || Date.now())),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
    
    return { 
      success: true, 
      message: `Successfully seeded database with ${seedUsers.length} users and ${seedOrders.length} orders!` 
    };
    
  } catch (error) {
    console.error('Error seeding database:', error);
    return { 
      success: false, 
      message: `Failed to seed database: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}