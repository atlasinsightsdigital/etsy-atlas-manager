import { getOrders } from '@/lib/actions';
import { OrdersDataTable } from '@/components/dashboard/orders/data-table';

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Order Management</h1>
        <p className="text-muted-foreground">
          View, create, and manage all your customer orders.
        </p>
      </div>
      <OrdersDataTable data={orders} />
    </div>
  );
}
