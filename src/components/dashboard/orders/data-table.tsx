'use client';
import * as React from 'react';
import { MoreHorizontal, Trash2, Edit, CheckCircle, XCircle, Truck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { Order } from '@/lib/definitions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { OrderForm } from './order-form';
import { deleteOrder } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
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
import { useFirestore } from '@/firebase';

// --- Columns Definition ---

function ActionsCell({ order }: { order: Order }) {
  const firestore = useFirestore();
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const { toast } = useToast();

  const handleDelete = () => {
    if (!firestore) return;
    startTransition(async () => {
      await deleteOrder(firestore, order.id);
      toast({ title: 'Success', description: 'Order deleted successfully.' });
      setIsDeleteDialogOpen(false);
    });
  };
  
  return (
    <>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DialogTrigger asChild>
                 <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                 </DropdownMenuItem>
              </DialogTrigger>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this order.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isPending}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
            <DialogDescription>Update the details for order {order.etsyOrderId}.</DialogDescription>
          </DialogHeader>
          <OrderForm order={order} setOpen={setIsEditDialogOpen} />
        </DialogContent>
      </Dialog>
    </>
  );
}

const statusConfigMap: { [key in Order['status']]: { variant: "default" | "secondary" | "destructive" | "outline", icon: React.ReactNode} } = {
  Pending: { variant: 'outline', icon: <Clock className="mr-1 h-3 w-3" /> },
  Shipped: { variant: 'secondary', icon: <Truck className="mr-1 h-3 w-3" /> },
  Delivered: { variant: 'default', icon: <CheckCircle className="mr-1 h-3 w-3" /> },
  Cancelled: { variant: 'destructive', icon: <XCircle className="mr-1 h-3 w-3" /> },
};


const columns: {
    header: string;
    id: keyof Order | 'profit' | 'actions';
    cell?: (row: Order) => React.ReactNode;
}[] = [
  { id: 'etsyOrderId', header: 'Order ID' },
  { id: 'orderDate', header: 'Date' },
  { id: 'status', header: 'Status', cell: ({status}: Order) => {
        const config = statusConfigMap[status] || {variant: 'outline', icon: null};
        return <Badge variant={config.variant} className="items-center">{config.icon}{status}</Badge>;
    }},
  { id: 'trackingNumber', header: 'Tracking'},
  { id: 'orderPrice', header: 'Total', cell: ({orderPrice}: Order) => orderPrice.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })},
  { id: 'profit', header: 'Profit', cell: ({orderPrice, orderCost, shippingCost, additionalFees}: Order) => {
      const profit = orderPrice - (orderCost + shippingCost + additionalFees);
      return <span className={profit > 0 ? 'text-green-600' : 'text-destructive'}>{profit.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}</span>;
    }},
  { id: 'actions', header: 'Actions', cell: (order: Order) => <ActionsCell order={order} /> },
];


// --- Data Table Component ---

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

  const renderMobileCard = (row: Order) => (
    <Card key={row.id} className="mb-4">
        <CardContent className="p-4 space-y-2">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold">{row.etsyOrderId}</p>
                    <p className="text-sm text-muted-foreground">{row.orderDate}</p>
                </div>
                <ActionsCell order={row} />
            </div>
            <div className="flex justify-between items-center">
                {columns.find(c => c.id === 'status')?.cell?.(row)}
                <span className="font-semibold">{columns.find(c => c.id === 'orderPrice')?.cell?.(row)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Profit</span>
                {columns.find(c => c.id === 'profit')?.cell?.(row)}
            </div>
            {row.trackingNumber && (
                <div className="text-sm text-muted-foreground pt-1">
                    Tracking: <span className="font-mono text-xs">{row.trackingNumber}</span>
                </div>
            )}
        </CardContent>
    </Card>
  );

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
                        : column.id === 'profit' || column.id === 'actions'
                        ? ''
                        : String((row[column.id as keyof Order] as any) ?? '')
                      }
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
