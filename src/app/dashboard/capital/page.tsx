
import { getCapitalEntries } from '@/lib/actions';
import { CapitalDataTable } from '@/components/dashboard/capital/data-table';
import { columns } from '@/components/dashboard/capital/columns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, PiggyBank, Scale } from 'lucide-react';

export default async function CapitalPage() {
  const entries = await getCapitalEntries();
  const totalCapital = entries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalLoans = entries.filter(e => e.type === 'loan').reduce((sum, entry) => sum + entry.amount, 0);
  const pureCapital = entries.filter(e => ['payout', 'personal'].includes(e.type)).reduce((sum, entry) => sum + entry.amount, 0);


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Capital Management</h1>
        <p className="text-muted-foreground">
          Track all capital movements like payouts, loans, and personal injections.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-md col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Capital</CardTitle>
            <Landmark className="h-5 w-5 text-muted-foreground" />
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
        
        <Card className="shadow-md bg-destructive/10 border-destructive/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-destructive/80">Total Loans</CardTitle>
            <Scale className="h-5 w-5 text-destructive/80" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tracking-tight text-destructive">
              {totalLoans.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
            </p>
            <p className="text-xs text-destructive/70">
              Total amount from borrowed funds.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md bg-primary/10 border-primary/50 col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary/80">Pure Capital (Payouts & Personal)</CardTitle>
            <PiggyBank className="h-5 w-5 text-primary/80" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tracking-tight text-primary">
              {pureCapital.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
            </p>
            <p className="text-xs text-primary/70">
              Total capital from your own funds and Etsy payouts.
            </p>
          </CardContent>
        </Card>
      </div>

      <CapitalDataTable columns={columns} data={entries} />
    </div>
  );
}
