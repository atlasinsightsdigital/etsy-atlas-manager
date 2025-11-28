import { Overview } from '@/components/dashboard/overview';
import { getOrders } from '@/lib/actions';

export default async function DashboardPage() {
  const allOrders = await getOrders();

  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Welcome back!</h1>
        <p className="text-muted-foreground">Here&apos;s a summary of your Etsy store&apos;s performance.</p>
      </div>
      <Overview orders={allOrders} />
    </div>
  );
}
