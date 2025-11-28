
import { getUsers } from '@/lib/actions';
import { UsersDataTable } from '@/components/dashboard/users/data-table';
import { columns } from '@/components/dashboard/users/columns';

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">User Management</h1>
        <p className="text-muted-foreground">
          View and manage all users.
        </p>
      </div>
      <UsersDataTable columns={columns} data={users} />
    </div>
  );
}
