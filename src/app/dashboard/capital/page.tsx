
import { getCapitalEntries } from '@/lib/actions';
import { CapitalDataTable } from '@/components/dashboard/capital/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, PiggyBank, Scale, TrendingDown } from 'lucide-react';

export default async function CapitalPage() {
  const entries = await getCapitalEntries();
  
  const totalInjections = entries
    .filter(e => e.type === 'payout' || e.type === 'loan')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalWithdrawals = entries
    .filter(e => e.type === 'withdraw')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalCapital = totalInjections - totalWithdrawals;

  const totalLoans = entries
    .filter(e => e.type === 'loan')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const pureCapitalInjections = entries
    .filter(e => e.type === 'payout')
    .reduce((sum, entry) => sum + entry.amount, 0);
  
  const pureCapital = pureCapitalInjections - totalWithdrawals;


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Capital Management</h1>
        <p className="text-muted-foreground">
          Track all capital movements like payouts, loans, and personal injections.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-md sm:col-span-2 lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Capital</CardTitle>
            <Landmark className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight">
              {totalCapital.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
            </p>
            <p className="text-xs text-muted-foreground">
              Total capital injected minus withdrawals.
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-md bg-destructive/10 border-destructive/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-destructive/80">Total Loans</CardTitle>
            <Scale className="h-5 w-5 text-destructive/80" />
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold tracking-tight text-destructive">
              {totalLoans.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
            </p>
            <p className="text-xs text-destructive/70">
              Total amount from borrowed funds.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md bg-primary/10 border-primary/50 sm:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary/80">Pure Capital (Net)</CardTitle>
            <PiggyBank className="h-5 w-5 text-primary/80" />
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold tracking-tight text-primary">
              {pureCapital.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
            </p>
            <p className="text-xs text-primary/70">
              Payouts and personal funds minus withdrawals.
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-md bg-secondary/80 border-secondary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-secondary-foreground">Total Withdrawals</CardTitle>
            <TrendingDown className="h-5 w-5 text-secondary-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold tracking-tight text-secondary-foreground">
              {totalWithdrawals.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
            </p>
            <p className="text-xs text-muted-foreground">
              Total amount withdrawn for personal use.
            </p>
          </CardContent>
        </Card>
      </div>

      <CapitalDataTable data={entries} />
    </div>
  );
}
