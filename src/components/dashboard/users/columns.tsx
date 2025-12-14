'use client';
import type { User } from '@/lib/definitions';
import { Badge } from '@/components/ui/badge';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';

function formatDate(date: any): string {
    if (!date) return '';
    const jsDate = date instanceof Timestamp ? date.toDate() : new Date(date);
    return format(jsDate, 'dd MMM yyyy');
}

const roleVariantMap: { [key in User['role']]: "default" | "secondary" | "destructive" | "outline" } = {
  admin: 'destructive',
  user: 'secondary',
};

export const columns: {
    header: string;
    id: keyof User;
    cell?: (row: User) => React.ReactNode;
}[] = [
  { id: 'name', header: 'Display Name' },
  { id: 'email', header: 'Email' },
  { id: 'role', header: 'Role', cell: ({ role }: User) => (
        <Badge variant={roleVariantMap[role] || 'outline'} className="capitalize">{role}</Badge>
    )},
  { id: 'createdAt', header: 'Created At', cell: ({ createdAt }: User) => formatDate(createdAt) },
];
