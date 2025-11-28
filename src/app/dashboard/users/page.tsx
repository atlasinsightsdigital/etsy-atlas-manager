'use client';
import { useCollection } from '@/firebase';
import { UsersDataTable } from '@/components/dashboard/users/data-table';
import type { User } from '@/lib/definitions';
import { useFirestore } from '@/firebase';
import { collection, query } from 'firebase/firestore';

export default function UsersPage() {
  const firestore = useFirestore();

  const usersQuery = firestore ? query(collection(firestore, 'users')) : null;

  const { data: users, isLoading } = useCollection<User>(usersQuery);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">User Management</h1>
        <p className="text-muted-foreground">
          View and manage all users.
        </p>
      </div>
      <UsersDataTable data={users || []} isLoading={isLoading}/>
    </div>
  );
}
