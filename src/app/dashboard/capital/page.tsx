
import { getCapitalEntries } from '@/lib/actions';
import { CapitalDataTable } from '@/components/dashboard/capital/data-table';
import { columns } from '@/components/dashboard/capital/columns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function CapitalPage() {
  const entries = await getCapitalEntries();
  const totalCapital = entries.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Capital Management</h1>
        <p className="text-muted-foreground">
          Track all capital movements like payouts, loans, and personal injections.
        </p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Capital</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold tracking-tight">
            {totalCapital.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
          </p>
          <p className="text-xs text-muted-foreground">
            Total capital injected from all sources.
          </p>
        </CardContent>
      </Card>

      <CapitalDataTable columns={columns} data={entries} />
    </div>
  );
}
