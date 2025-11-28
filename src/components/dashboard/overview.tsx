'use client';

import type { Order } from '@/lib/definitions';
import { StatCard } from './stat-card';
import { DollarSign, Package, TrendingUp, CreditCard } from 'lucide-react';
import AiSummary from './ai-summary';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

type OverviewProps = {
  orders: Order[];
};

export function Overview({ orders }: OverviewProps) {
  const validOrders = orders.filter(order => order.status !== 'Cancelled');
  const totalRevenue = validOrders.reduce((sum, order) => sum + order.orderPrice, 0);
  const totalExpenses = validOrders.reduce((sum, order) => sum + order.orderCost + order.shippingCost + order.additionalFees, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const totalOrders = validOrders.length;
  
  const chartData = [
    { month: 'Jan', revenue: 1860 },
    { month: 'Feb', revenue: 3050 },
    { month: 'Mar', revenue: 2370 },
    { month: 'Apr', revenue: 730 },
    { month: 'May', revenue: 2090 },
    { month: 'Jun', revenue: 2140 },
  ];

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig

  const aiSummaryInput = {
    totalOrders,
    profitMargin: parseFloat(profitMargin.toFixed(2)),
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    totalExpenses: parseFloat(totalExpenses.toFixed(2)),
    startDate: 'the beginning of time',
    endDate: 'today',
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      <div className="lg:col-span-4">
        <AiSummary {...aiSummaryInput} />
      </div>

      <StatCard
        title="Total Revenue"
        value={totalRevenue.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        })}
        icon={<DollarSign />}
        description="Total revenue from all sales."
      />
      <StatCard
        title="Profit Margin"
        value={`${profitMargin.toFixed(1)}%`}
        icon={<TrendingUp />}
        description="Net profit as a percentage of revenue."
      />
      <StatCard
        title="Total Orders"
        value={`+${totalOrders}`}
        icon={<Package />}
        description="Total number of orders."
      />
       <StatCard
        title="Total Profit"
        value={totalProfit.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        })}
        icon={<CreditCard />}
        description="Total profit after all expenses."
      />

      <Card className="lg:col-span-4 shadow-md">
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>A look at your revenue over the last 6 months.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value / 1000}K`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={8} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
