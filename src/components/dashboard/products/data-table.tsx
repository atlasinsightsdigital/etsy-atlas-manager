
'use client';
import * as React from 'react';
import Image from 'next/image';
import { MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Product } from '@/lib/definitions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ProductForm } from './product-form';
import { deleteProduct } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
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

// --- Columns Definition ---

function ActionsCell({ product }: { product: Product }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const { toast } = useToast();
  const router = useRouter();
  
  const handleDelete = () => {
    startTransition(async () => {
      await deleteProduct(product.id);
      toast({ title: 'Success', description: 'Product deleted successfully.' });
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
                This action cannot be undone. This will permanently delete this product.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isPending}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update the details for {product.name}.</DialogDescription>
          </DialogHeader>
          <ProductForm product={product} setOpen={setIsEditDialogOpen} />
        </DialogContent>
      </Dialog>
    </>
  );
}

const columns: {
    header: string;
    id: keyof Product | 'actions';
    cell?: (row: Product) => React.ReactNode;
}[] = [
  { id: 'name', header: 'Product', cell: (row: Product) => (
      <div className="flex items-center gap-4">
        <Image
          src={row.imageUrl}
          alt={row.name}
          width={40}
          height={40}
          className="rounded-md"
          data-ai-hint={row.imageHint}
        />
        <span className="font-medium">{row.name}</span>
      </div>
    )},
  { id: 'category', header: 'Category' },
  { id: 'price', header: 'Price', cell: (row: Product) => row.price.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' }) },
  { id: 'stock', header: 'Stock' },
  { id: 'actions', header: 'Actions', cell: (row: Product) => <ActionsCell product={row} /> },
];

// --- Data Table Component ---

interface DataTableProps {
  data: Product[];
}

export function ProductsDataTable({ data }: DataTableProps) {
  const [filter, setFilter] = React.useState('');
  const [open, setOpen] = React.useState(false);

  const filteredData = data.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(filter.toLowerCase())
    )
  );

  const renderMobileCard = (row: Product) => (
    <Card key={row.id} className="mb-4">
        <CardContent className="p-4 flex items-center gap-4">
            <Image
              src={row.imageUrl}
              alt={row.name}
              width={64}
              height={64}
              className="rounded-md"
              data-ai-hint={row.imageHint}
            />
            <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                    <p className="font-bold">{row.name}</p>
                    <ActionsCell product={row} />
                </div>
                <p className="text-sm text-muted-foreground">{row.category}</p>
                <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold">{columns.find(c => c.id === 'price')?.cell?.(row)}</span>
                    <span className="text-muted-foreground">Stock: {row.stock}</span>
                </div>
            </div>
        </CardContent>
    </Card>
  );


  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-2">
        <Input
          placeholder="Filter products..."
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="w-full sm:max-w-sm"
        />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Fill in the details for the new product.
              </DialogDescription>
            </DialogHeader>
            <ProductForm setOpen={setOpen} />
          </DialogContent>
        </Dialog>
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
                        : String(row[column.id as keyof Product] ?? '')}
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
