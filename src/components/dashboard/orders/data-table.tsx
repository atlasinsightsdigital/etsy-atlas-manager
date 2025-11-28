'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import type { Order } from '@/lib/definitions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { OrderForm } from './order-form';
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
import { columns } from './columns';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

function formatDate(date: any): string {
  if (!date) return '';
  const jsDate = date instanceof Timestamp ? date.toDate() : new Date(date);
  return format(jsDate, 'dd MMM yyyy');
}

interface DataTableProps {
  data: Order[];
  isLoading: boolean;
}

export function OrdersDataTable({ data, isLoading }: DataTableProps) {
  const [filter, setFilter] = React.useState('');
  const [open, setOpen] = React.useState(false);

  const filteredData = data.filter((item) => {
    const searchableFields: (keyof Order)[] = ['etsyOrderId', 'status', 'trackingNumber', 'notes'];
    return searchableFields.some(field => {
        const value = item[field];
        return typeof value === 'string' && value.toLowerCase().includes(filter.toLowerCase());
    });
  });

  const renderMobileCard = (row: Order) => {
    const statusCell = columns.find(c => c.id === 'status');
    const orderPriceCell = columns.find(c => c.id === 'orderPrice');
    const profitCell = columns.find(c => c.id === 'profit');
    const actionsCell = columns.find(c => c.id === 'actions');

    return (
        <Card key={row.id} className="mb-4">
            <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold">{row.etsyOrderId}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(row.orderDate)}</p>
                    </div>
                    {actionsCell?.cell?.(row)}
                </div>
                <div className="flex justify-between items-center">
                    {statusCell?.cell?.(row)}
                    <span className="font-semibold">{orderPriceCell?.cell?.(row)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Profit</span>
                    {profitCell?.cell?.(row)}
                </div>
                {row.trackingNumber && (
                    <div className="text-sm text-muted-foreground pt-1">
                        Tracking: <span className="font-mono text-xs">{row.trackingNumber}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-2">
        <Input
          placeholder="Filter by ID, status, tracking..."
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="w-full sm:max-w-sm"
        />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Order</DialogTitle>
              <DialogDescription>
                Fill in the details for the new order.
              </DialogDescription>
            </DialogHeader>
            <OrderForm setOpen={setOpen} />
          </DialogContent>
        </Dialog>
      </div>

       {/* Mobile View */}
       <div className="sm:hidden">
        {isLoading ? <p className="text-center py-8 text-muted-foreground">Loading orders...</p> : filteredData.length > 0 ? (
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
                <TableCell colSpan={columns.length} className="h-24 text-center">Loading...</TableCell>
              </TableRow>
            ) : filteredData.length ? (
              filteredData.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((column) => (
                    <TableCell key={column.id}>
                      {column.cell
                        ? column.cell(row)
                        : (row[column.id as keyof Order] as React.ReactNode) ?? ''}
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
