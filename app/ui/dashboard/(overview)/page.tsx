import { Suspense } from 'react';
import { Card } from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import { lusitana } from '@/app/ui/fonts';
import DashboardSkeleton from '@/app/ui/skeletons';
import { CardData } from '@/app/lib/definitions';
import {
  fetchRevenue,
  fetchLatestInvoices,
  fetchCardData,
} from '@/app/lib/data';
import { Revenue, LatestInvoice } from '@/app/lib/definitions';

export default async function Page() {
  try {
    const [revenueData, latestInvoicesData, cardData] = await Promise.all([
      fetchRevenue(),
      fetchLatestInvoices(),
      fetchCardData(),
    ]);

    // Remove .rows access since revenueData is already an array
    const revenue = revenueData ?? [];
    const latestInvoices = latestInvoicesData ?? [];

    const {
      numberOfInvoices,
      numberOfCustomers,
      totalPaidInvoices,
      totalPendingInvoices,
    } = cardData;

    return (
      <main>
        <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
          Dashboard
        </h1>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card title="Collected" value={totalPaidInvoices} type="collected" />
          <Card title="Pending" value={totalPendingInvoices} type="pending" />
          <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
          <Card title="Total Customers" value={numberOfCustomers} type="customers" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
          <RevenueChart revenue={revenue} />
          {latestInvoices.length > 0 ? (
            <LatestInvoices latestInvoices={latestInvoices} />
          ) : (
            <p>No recent invoices found.</p>
          )}
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error:', error);
    return <div>Error loading dashboard data</div>;
  }
}
