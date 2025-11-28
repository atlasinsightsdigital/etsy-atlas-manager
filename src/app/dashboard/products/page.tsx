import { getProducts } from '@/lib/actions';
import { ProductsDataTable } from '@/components/dashboard/products/data-table';

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Product Catalog</h1>
        <p className="text-muted-foreground">
          View, add, and manage your store's products.
        </p>
      </div>
      <ProductsDataTable data={products} />
    </div>
  );
}
