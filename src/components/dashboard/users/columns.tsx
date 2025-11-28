
'use client';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import type { User } from '@/lib/definitions';

const roleVariantMap: { [key in User['role']]: "default" | "secondary" | "destructive" | "outline" } = {
  admin: 'destructive',
  user: 'secondary',
};

export const columns: {
    header: string;
    accessorKey?: keyof User;
    cell?: (row: User) => React.ReactNode;
}[] = [
  {
    header: 'Display Name',
    accessorKey: 'name',
  },
  {
    header: 'Email',
    accessorKey: 'email',
  },
  {
    header: 'Role',
    cell: ({ role }: User) => {
        const variant = roleVariantMap[role] || 'outline';
        return (
            <Badge variant={variant} className="capitalize">
                {role}
            </Badge>
        );
    },
  },
  {
    header: 'Created At',
    accessorKey: 'createdAt',
  },
];
