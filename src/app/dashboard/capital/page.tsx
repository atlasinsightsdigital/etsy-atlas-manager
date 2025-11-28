
import { getCapitalEntries } from '@/lib/actions';
import { CapitalDataTable } from '@/components/dashboard/capital/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, TrendingDown, TrendingUp } from 'lucide-react';

export default async function CapitalPage() {
  const entries = await getCapitalEntries();
  
  const totalDeposits = entries
    .filter(e => e.type === 'Deposit')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalWithdrawals = entries
    .filter(e => e.type === 'Withdrawal')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalCapital = totalDeposits - totalWithdrawals;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Capital Management</h1>
        <p className="text-muted-foreground">
          Track all capital movements like deposits and withdrawals.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="shadow-md sm:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Capital</CardTitle>
            <Landmark className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight">
              {totalCapital.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
            </p>
            <p className="text-xs text-muted-foreground">
              Total deposits minus total withdrawals.
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-md bg-primary/10 border-primary/50 sm:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary/80">Total Deposits</CardTitle>
            <TrendingUp className="h-5 w-5 text-primary/80" />
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold tracking-tight text-primary">
              {totalDeposits.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
            </p>
            <p className="text-xs text-primary/70">
              Total funds added to capital.
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-md bg-destructive/10 border-destructive/50 sm:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-destructive/80">Total Withdrawals</CardTitle>
            <TrendingDown className="h-5 w-5 text-destructive/80" />
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold tracking-tight text-destructive">
              {totalWithdrawals.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
            </p>
            <p className="text-xs text-destructive/70">
              Total funds withdrawn from capital.
            </p>
          </CardContent>
        </Card>
      </div>

      <CapitalDataTable data={entries} />
    </div>
  );
}
