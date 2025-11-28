
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
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { addCapitalEntry } from '@/lib/actions';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  type: z.enum(['payout', 'loan', 'withdraw']),
  amount: z.coerce.number().positive('Amount must be a positive number.'),
  source: z.string().min(1, 'Source is required'),
  transactionDate: z.string().min(1, 'Transaction date is required.'),
  submittedBy: z.string().min(1, 'Submitter is required.'),
  notes: z.string().optional(),
});

type CapitalFormProps = {
  setOpen: (open: boolean) => void;
};

export function CapitalEntryForm({ setOpen }: CapitalFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // TODO: Replace with actual logged-in user email
  const currentUserEmail = 'admin@etsyatlas.com';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'payout',
      amount: 0,
      source: 'Etsy',
      transactionDate: new Date().toISOString().split('T')[0],
      submittedBy: currentUserEmail,
      notes: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        await addCapitalEntry(values);
        toast({ title: 'Success', description: 'Capital entry added successfully.' });
        router.refresh();
        setOpen(false);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong.',
        });
      }
    });
  }

  const isWithdraw = form.watch('type') === 'withdraw';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select an entry type" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="payout">Payout</SelectItem>
                    <SelectItem value="loan">Loan</SelectItem>
                    <SelectItem value="withdraw">Withdraw</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
              <FormItem>
                  <FormLabel>Source</FormLabel>
                   <FormControl>
                     { isWithdraw ? (
                        <Input placeholder="e.g. Personal" {...field} />
                     ) : (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger><SelectValue placeholder="Select a source" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Etsy">Etsy</SelectItem>
                                <SelectItem value="Personal">Personal</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                     )
                    }
                  </FormControl>
                  <FormMessage />
              </FormItem>
              )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="transactionDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transaction Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Add an optional note..." className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={form.control}
            name="submittedBy"
            render={({ field }) => (
            <FormItem className="hidden">
                <FormLabel>Submitted By</FormLabel>
                <FormControl>
                  <Input {...field} readOnly />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Entry
            </Button>
        </div>
      </form>
    </Form>
  );
}
