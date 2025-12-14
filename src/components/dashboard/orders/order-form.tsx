'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useTransition } from 'react';
import type { Order } from '@/lib/definitions';
import { addOrder, updateOrder } from '@/lib/actions';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Timestamp } from 'firebase/firestore';


// Zod Schema
const formSchema = z.object({
  etsyOrderId: z.string().min(1, 'Etsy Order ID is required'),
  orderDate: z.string().min(1, 'Order date is required'),
  status: z.enum(['Pending', 'Shipped', 'Delivered', 'Cancelled']),
  orderPrice: z.coerce.number().positive('Must be positive'),
  orderCost: z.coerce.number().min(0),
  shippingCost: z.coerce.number().min(0),
  additionalFees: z.coerce.number().min(0),
  notes: z.string().optional(),
  trackingNumber: z.string().optional(),
});

type OrderFormProps = {
  order?: Order;
  setOpen: (open: boolean) => void;
};

// Helper to convert Firestore Timestamp or string to 'yyyy-MM-dd' format
function formatDateForInput(date: any): string {
    if (!date) return '';
    // Handles Firestore Timestamps, ISO strings, and JS Date objects
    const jsDate = date instanceof Timestamp ? date.toDate() : new Date(date);
    if (isNaN(jsDate.getTime())) return ''; // Invalid date
    
    // Adjust for timezone offset to get the correct local date
    const timezoneOffset = jsDate.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(jsDate.getTime() - timezoneOffset);
    return adjustedDate.toISOString().split('T')[0];
}


export function OrderForm({ order, setOpen }: OrderFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: order
      ? {
          ...order,
          orderDate: formatDateForInput(order.orderDate),
          notes: order.notes || '',
          trackingNumber: order.trackingNumber || '',
        }
      : {
          etsyOrderId: '',
          orderDate: new Date().toISOString().split('T')[0],
          status: 'Pending',
          orderPrice: 0,
          orderCost: 0,
          shippingCost: 0,
          additionalFees: 0,
          notes: '',
          trackingNumber: '',
        },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        if (order) {
          await updateOrder(order.id, values);
          toast({ title: 'Success', description: 'Order updated.' });
        } else {
          await addOrder(values as Omit<Order, 'id'>);
          toast({ title: 'Success', description: 'Order created.' });
        }
        setOpen(false);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: (error as Error).message,
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {/* FIRST SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="etsyOrderId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Etsy Order ID</FormLabel>
                <FormControl>
                  <Input {...field} disabled={!!order} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="trackingNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tracking Number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="orderDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} disabled={!!order} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Shipped">Shipped</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* PRICES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {['orderPrice','orderCost','shippingCost','additionalFees'].map((name) => (
            <FormField
              key={name}
              control={form.control}
              name={name as 'orderPrice' | 'orderCost' | 'shippingCost' | 'additionalFees'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} disabled={name === 'orderPrice' && !!order} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        {/* NOTES */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} className="resize-none" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {order ? 'Update Order' : 'Create Order'}
          </Button>
        </div>

      </form>
    </Form>
  );
}
