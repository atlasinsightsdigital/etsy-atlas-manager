
import { getCapitalEntries } from '@/lib/actions';
import { CapitalDataTable } from '@/components/dashboard/capital/data-table';
import { columns } from '@/components/dashboard/capital/columns';

export default async function CapitalPage() {
  const entries = await getCapitalEntries();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Capital Management</h1>
        <p className="text-muted-foreground">
          Track all capital movements like payouts, loans, and personal injections.
        </p>
      </div>
      <CapitalDataTable columns={columns} data={entries} />
    </div>
  );
}
