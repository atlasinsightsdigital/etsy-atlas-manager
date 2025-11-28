import { Overview } from '@/components/dashboard/overview';
import { getOrders } from '@/lib/actions';
import { cookies } from 'next/headers';

export default async function DashboardPage() {
  const allOrders = await getOrders();
  const cookieStore = cookies();
  const session = cookieStore.get('session');
  const user = session ? JSON.parse(session.value) : null;

  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Welcome back, {user?.name.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">Here&apos;s a summary of your Etsy store&apos;s performance.</p>
      </div>
      <Overview orders={allOrders} />
    </div>
  );
}
