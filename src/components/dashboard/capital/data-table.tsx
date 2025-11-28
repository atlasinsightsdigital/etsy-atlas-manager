'use client';
import * as React from 'react';
import { MoreHorizontal, Trash2, ArrowDown, ArrowUp } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CapitalEntryForm } from './capital-form';
import { Card, CardContent } from '@/components/ui/card';
import { useFirestore } from '@/firebase';

// --- Columns Definition ---
function ActionsCell({ entry }: { entry: CapitalEntry }) {
  const firestore = useFirestore();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const { toast } = useToast();

  const handleDelete = () => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firestore not available.' });
      return;
    }
    startTransition(async () => {
      await deleteCapitalEntry(firestore, entry.id);
      toast({ title: 'Success', description: 'Capital entry deleted successfully.' });
      setIsDeleteDialogOpen(false);
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

const typeConfigMap: { [key in CapitalEntry['type']]: { variant: "default" | "destructive", icon: React.ReactNode } } = {
  Deposit: { variant: 'default', icon: <ArrowUp className="mr-1 h-3 w-3" /> },
  Withdrawal: { variant: 'destructive', icon: <ArrowDown className="mr-1 h-3 w-3" /> },
};

const columns: {
    header: string;
    id: keyof CapitalEntry | 'actions';
    cell?: (row: CapitalEntry) => React.ReactNode;
}[] = [
  { id: 'createdAt', header: 'Entry Date', cell: ({ createdAt }: CapitalEntry) => format(new Date(createdAt as string), 'dd MMM yyyy')},
  { id: 'transactionDate', header: 'Transaction Date', cell: ({ transactionDate }: CapitalEntry) => format(new Date(transactionDate), 'dd MMM yyyy') },
  { id: 'type', header: 'Type', cell: ({ type }: CapitalEntry) => {
        const config = typeConfigMap[type];
        return <Badge variant={config.variant} className="capitalize items-center">{config.icon}{type}</Badge>;
    }},
  { id: 'amount', header: 'Amount', cell: ({ amount, type }: CapitalEntry) => (
      <span className={type === 'Withdrawal' ? 'text-destructive' : 'text-green-600'}>
          {type === 'Withdrawal' ? '-' : '+'}
          {amount.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
      </span>
  )},
  { id: 'source', header: 'Source' },
  { id: 'submittedBy', header: 'Submitted By' },
  { id: 'actions', header: 'Actions', cell: (entry: CapitalEntry) => <ActionsCell entry={entry} />},
];

// --- Data Table Component ---
interface DataTableProps {
  data: CapitalEntry[];
  isLoading: boolean;
}

export function CapitalDataTable({ data, isLoading }: DataTableProps) {
  const [filter, setFilter] = React.useState('');
  const [open, setOpen] = React.useState(false);

  const filteredData = data.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(filter.toLowerCase())
    )
  );

  const renderMobileCard = (row: CapitalEntry) => (
    <Card key={row.id} className="mb-4">
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between items-start">
            <div>
                <p className="font-bold">{row.source}</p>
                <p className="text-sm text-muted-foreground">{format(new Date(row.transactionDate), 'dd MMM yyyy')}</p>
            </div>
            <ActionsCell entry={row} />
        </div>
        <div className="flex justify-between items-center">
          {columns.find(c => c.id === 'type')?.cell?.(row)}
          {columns.find(c => c.id === 'amount')?.cell?.(row)}
        </div>
        <p className="text-xs text-muted-foreground pt-2">Submitted by: {row.submittedBy}</p>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-2">
        <Input
          placeholder="Filter entries..."
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
                        : String(row[column.id as keyof CapitalEntry] ?? '')}
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
