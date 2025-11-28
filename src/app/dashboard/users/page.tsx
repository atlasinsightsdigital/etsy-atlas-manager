import { getUsers } from '@/lib/actions';
import { UsersDataTable } from '@/components/dashboard/users/data-table';

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">User Management</h1>
        <p className="text-muted-foreground">
          View and manage all users.
        </p>
      </div>
      <UsersDataTable data={users} />
    </div>
  );
}
