'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import type { CapitalEntry } from '@/lib/definitions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CapitalEntryForm } from './capital-form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { columns } from './columns'; // Import columns from the single source of truth

function formatDate(date: any): string {
    if (!date) return '';
    const jsDate = date instanceof Timestamp ? date.toDate() : new Date(date);
    return format(jsDate, 'dd MMM yyyy');
}

// --- Data Table Component ---
interface DataTableProps {
  data: CapitalEntry[];
  isLoading: boolean;
}

export function CapitalDataTable({ data, isLoading }: DataTableProps) {
  const [filter, setFilter] = React.useState('');
  const [open, setOpen] = React.useState(false);

  const filteredData = data.filter((item) => {
    const searchableFields: (keyof CapitalEntry)[] = ['type', 'source', 'submittedBy', 'notes'];
    return searchableFields.some(field => {
        const value = item[field];
        return typeof value === 'string' && value.toLowerCase().includes(filter.toLowerCase());
    });
  });

  const renderMobileCard = (row: CapitalEntry) => {
    const actionsCell = columns.find(c => c.id === 'actions');
    const typeCell = columns.find(c => c.id === 'type');
    const amountCell = columns.find(c => c.id === 'amount');

    return (
        <Card key={row.id} className="mb-4">
        <CardContent className="p-4 space-y-2">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold">{row.source}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(row.transactionDate)}</p>
                </div>
                {actionsCell?.cell?.(row)}
            </div>
            <div className="flex justify-between items-center">
              {typeCell?.cell?.(row)}
              {amountCell?.cell?.(row)}
            </div>
            <p className="text-xs text-muted-foreground pt-2">Submitted by: {row.submittedBy}</p>
        </CardContent>
        </Card>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-2">
        <Input
          placeholder="Filter by source, submitter..."
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="w-full sm:max-w-sm"
        />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Capital Entry</DialogTitle>
              <DialogDescription>
                Fill in the details for the new capital entry.
              </DialogDescription>
            </DialogHeader>
            <CapitalEntryForm setOpen={setOpen} />
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Mobile View */}
      <div className="sm:hidden">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Loading entries...</p>
        ) : filteredData.length > 0 ? (
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
            {isLoading ? (
               <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredData.length ? (
              filteredData.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((column) => (
                    <TableCell key={column.id}>
                      {column.cell
                        ? column.cell(row)
                        : String((row[column.id as keyof CapitalEntry] as any) ?? '')}
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
