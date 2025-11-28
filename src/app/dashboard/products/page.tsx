import { getProducts } from '@/lib/actions';
import { ProductsDataTable } from '@/components/dashboard/products/data-table';
import { columns } from '@/components/dashboard/products/columns';

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Product Catalog</h1>
        <p className="text-muted-foreground">
          View, add, and manage your store's products.
        </p>
      </div>
      <ProductsDataTable columns={columns} data={products} />
    </div>
  );
}
