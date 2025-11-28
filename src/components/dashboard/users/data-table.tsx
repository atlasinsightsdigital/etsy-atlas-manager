
'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import type { User } from '@/lib/definitions';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

// --- Columns Definition ---
const roleVariantMap: { [key in User['role']]: "default" | "secondary" | "destructive" | "outline" } = {
  admin: 'destructive',
  user: 'secondary',
};

const columns: {
    header: string;
    id: keyof User;
    cell?: (row: User) => React.ReactNode;
}[] = [
  { id: 'name', header: 'Display Name' },
  { id: 'email', header: 'Email' },
  { id: 'role', header: 'Role', cell: ({ role }: User) => (
        <Badge variant={roleVariantMap[role] || 'outline'} className="capitalize">{role}</Badge>
    )},
  { id: 'createdAt', header: 'Created At' },
];


// --- Data Table Component ---
interface DataTableProps {
  data: User[];
}

export function UsersDataTable({ data }: DataTableProps) {
  const [filter, setFilter] = React.useState('');

  const filteredData = data.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(filter.toLowerCase())
    )
  );

  const renderMobileCard = (row: User) => (
    <Card key={row.id} className="mb-4">
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between items-start">
            <p className="font-bold">{row.name}</p>
            {columns.find(c => c.id === 'role')?.cell?.(row)}
        </div>
        <p className="text-sm text-muted-foreground">{row.email}</p>
        <p className="text-xs text-muted-foreground pt-2">Created: {row.createdAt}</p>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filter users..."
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="w-full sm:max-w-sm"
        />
      </div>

       {/* Mobile View */}
       <div className="sm:hidden">
        {filteredData.length > 0 ? (
            filteredData.map(renderMobileCard)
        ) : (
            <p className="text-center text-muted-foreground py-8">No results.</p>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden sm:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.id}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length ? (
              filteredData.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((column) => (
                    <TableCell key={column.id}>
                      {column.cell
                        ? column.cell(row)
                        : String(row[column.id] ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
