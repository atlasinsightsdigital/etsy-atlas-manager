'use client';
import { useCollection } from '@/firebase';
import { OrdersDataTable } from '@/components/dashboard/orders/data-table';
import type { Order } from '@/lib/definitions';
import { useFirestore } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { useMemo } from 'react';

export default function OrdersPage() {
  const firestore = useFirestore();

  const ordersQuery = useMemo(() => 
    firestore ? query(collection(firestore, 'orders')) : null,
    [firestore]
  );
  
  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Order Management</h1>
        <p className="text-muted-foreground">
          View, create, and manage all your customer orders.
        </p>
      </div>
      <OrdersDataTable data={orders || []} isLoading={isLoading} />
    </div>
  );
}
