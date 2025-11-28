
'use client';
import * as React from 'react';
import { MoreHorizontal, Trash2 } from 'lucide-react';
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
import type { CapitalEntry } from '@/lib/definitions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { deleteCapitalEntry } from '@/lib/actions';
import { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

function ActionsCell({ entry }: { entry: CapitalEntry }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteCapitalEntry(entry.id);
      toast({ title: 'Success', description: 'Capital entry deleted successfully.' });
      setIsDeleteDialogOpen(false);
      router.refresh();
    });
  };
  
  return (
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
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="text-destructive focus:text-destructive" disabled={entry.locked}>
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
            This action cannot be undone. This will permanently delete this capital entry.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const typeVariantMap: { [key in CapitalEntry['type']]: "default" | "secondary" | "outline" } = {
  payout: 'default',
  loan: 'destructive',
  personal: 'secondary',
};

export const columns: {
    header: string;
    accessorKey?: keyof CapitalEntry;
    cell?: (row: CapitalEntry) => React.ReactNode;
}[] = [
  {
    header: 'Date',
    cell: ({ createdAt }: CapitalEntry) => format(new Date(createdAt), 'dd MMM yyyy'),
  },
  {
    header: 'Type',
    cell: ({ type }: CapitalEntry) => {
        const variant = typeVariantMap[type] || 'outline';
        return <Badge variant={variant} className="capitalize">{type}</Badge>;
    },
  },
  {
    header: 'Amount',
    cell: ({ amount }: CapitalEntry) => amount.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' }),
  },
  {
    header: 'Source',
    accessorKey: 'source',
  },
  {
    header: 'Reference ID',
    accessorKey: 'referenceId',
  },
  {
    header: 'Submitted By',
    accessorKey: 'submittedBy',
  },
  {
    header: 'Actions',
    cell: (entry: CapitalEntry) => <ActionsCell entry={entry} />,
  },
];
