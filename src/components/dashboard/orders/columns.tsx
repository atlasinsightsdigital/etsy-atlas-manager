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
import { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

function ActionsCell({ order }: { order: Order }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteOrder(order.id);
      toast({ title: 'Success', description: 'Order deleted successfully.' });
      setIsDeleteDialogOpen(false);
      router.refresh();
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

const statusVariantMap: { [key in Order['status']]: { variant: "default" | "secondary" | "destructive" | "outline", icon: React.ReactNode} } = {
  Pending: { variant: 'outline', icon: <Clock className="mr-1" /> },
  Shipped: { variant: 'secondary', icon: <Truck className="mr-1" /> },
  Delivered: { variant: 'default', icon: <CheckCircle className="mr-1" /> },
  Cancelled: { variant: 'destructive', icon: <XCircle className="mr-1" /> },
};


export const columns: {
    header: string;
    accessorKey?: keyof Order;
    cell?: (row: Order) => React.ReactNode;
}[] = [
  {
    header: 'Order ID',
    accessorKey: 'etsyOrderId',
  },
  {
    header: 'Customer',
    accessorKey: 'customerName',
  },
  {
    header: 'Date',
    accessorKey: 'orderDate',
  },
  {
    header: 'Status',
    cell: ({status}: Order) => {
        const {variant, icon} = statusVariantMap[status] || {variant: 'outline', icon: null};
        return (
            <Badge variant={variant} className="items-center">
                {icon}
                {status}
            </Badge>
        );
    },
  },
  {
    header: 'Total Price',
    cell: ({orderPrice}: Order) => orderPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
  },
    {
    header: 'Profit',
    cell: ({orderPrice, orderCost, shippingCost, additionalFees}: Order) => {
      const profit = orderPrice - (orderCost + shippingCost + additionalFees);
      return profit.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }
  },
  {
    header: 'Actions',
    cell: (order: Order) => <ActionsCell order={order} />,
  },
];
