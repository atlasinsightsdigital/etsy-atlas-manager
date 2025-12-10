'use server';

import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { getFirestoreAdmin } from '@/lib/admin';
import type { Order } from './definitions';
import { z } from 'zod';

// ✅ Move NON-ASYNC exports to a separate file or remove 'use server'
// If you need to export schemas/types, do it in a different file
// For now, let's just define them internally without exporting

const orderSchema = z.object({
  etsyOrderId: z.string().min(1, 'Etsy Order ID is required'),
  orderDate: z.string().min(1, 'Order date is required'),
  status: z.enum(['Pending', 'Shipped', 'Delivered', 'Cancelled']),
  orderPrice: z.coerce.number().positive('Must be positive'),
  orderCost: z.coerce.number().min(0),
  shippingCost: z.coerce.number().min(0),
  additionalFees: z.coerce.number().min(0),
  notes: z.string().optional(),
  trackingNumber: z.string().optional(),
});

type OrderInput = z.infer<typeof orderSchema>;

// ✅ Only export ASYNC functions
export async function createOrder(data: OrderInput) {
  const db = await getFirestoreAdmin();
  
  // Validate input
  orderSchema.parse(data);
  
  const orderData = {
    ...data,
    orderDate: Timestamp.fromDate(new Date(data.orderDate)),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  try {
    const docRef = await db.collection('orders').add(orderData);
    return { id: docRef.id, ...data };
  } catch (error) {
    // 🔴 FIXED: Safe error handling
    console.error('❌ REAL ERROR creating order:', error);
    
    // Get error message safely
    let errorMessage = 'Unknown error occurred';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String(error.message);
    } else if (error && typeof error === 'object' && 'toString' in error) {
      errorMessage = error.toString();
    }
    
    // Also check for Firebase-specific error codes
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('❌ Firebase error code:', error.code);
      errorMessage += ` (Code: ${error.code})`;
    }
    
    console.error('❌ Full error object:', JSON.stringify(error, null, 2));
    console.error('❌ Data that failed:', JSON.stringify(orderData, null, 2));
    
    // Throw with safe message
    throw new Error(`Failed to create order: ${errorMessage}`);
  }
}

export async function updateOrder(id: string, data: Partial<OrderInput>) {
  const db = await getFirestoreAdmin();
  
  // Validate input if provided
  if (Object.keys(data).length > 0) {
    orderSchema.partial().parse(data);
  }

  const updateData: any = {
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  };

  // Convert orderDate if present
  if (data.orderDate) {
    updateData.orderDate = Timestamp.fromDate(new Date(data.orderDate));
  }

  try {
    await db.doc(`orders/${id}`).update(updateData);
    return { id, ...data };
  } catch (error) {
    console.error('Error updating order:', error);
    throw new Error('Failed to update order');
  }
}

export async function deleteOrder(id: string) {
  const db = await getFirestoreAdmin();
  
  try {
    await db.doc(`orders/${id}`).delete();
    return { success: true };
  } catch (error) {
    console.error('Error deleting order:', error);
    throw new Error('Failed to delete order');
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  const db = await getFirestoreAdmin();
  
  try {
    const doc = await db.doc(`orders/${id}`).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return { id: doc.id, ...doc.data() } as Order;
  } catch (error) {
    console.error('Error getting order:', error);
    throw new Error('Failed to get order');
  }
}

// ✅ NO non-async exports at the end of the file!
