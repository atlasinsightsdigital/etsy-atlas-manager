'use server';

import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { getFirestoreAdmin } from '@/lib/admin';
import { orders as seedOrders, users as seedUsers } from './data';

export async function seedDatabase() {
  try {
    const db = await getFirestoreAdmin();
    
    const [ordersSnapshot, usersSnapshot] = await Promise.all([
      db.collection('orders').limit(1).get(),
      db.collection('users').limit(1).get(),
    ]);

    if (!ordersSnapshot.empty || !usersSnapshot.empty) {
      return { 
        success: false, 
        message: 'La base de données contient déjà des données. Le peuplement a été ignoré.' 
      };
    }

    const batch = db.batch();

    const usersCollection = db.collection('users');
    seedUsers.forEach(user => {
      const docRef = usersCollection.doc();
      batch.set(docRef, {
        ...user,
        createdAt: FieldValue.serverTimestamp(),
        id: docRef.id
      });
    });

    const ordersCollection = db.collection('orders');
    seedOrders.forEach((order, index) => {
      const docRef = ordersCollection.doc();
      // Use past dates for more realistic data
      const orderDate = new Date();
      orderDate.setMonth(orderDate.getMonth() - (index % 6));
      orderDate.setDate(Math.floor(Math.random() * 28) + 1);

      batch.set(docRef, {
        ...order,
        orderDate: Timestamp.fromDate(orderDate),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
    
    return { 
      success: true, 
      message: `Base de données peuplée avec ${seedUsers.length} utilisateurs et ${seedOrders.length} commandes.` 
    };
    
  } catch (error) {
    console.error('Erreur lors du peuplement de la base de données:', error);
    return { 
      success: false, 
      message: `Échec du peuplement: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
    };
  }
}
