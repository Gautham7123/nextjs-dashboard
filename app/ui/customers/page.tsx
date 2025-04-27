import { fetchCustomers } from '@/app/lib/data';
import { lusitana } from '@/app/ui/fonts';
import CustomersTable from '@/app/ui/customers/table';
import { Suspense } from 'react';
import { CustomersTableSkeleton } from '@/app/ui/skeletons';

export default async function CustomersPage() {
  const customers = await fetchCustomers();

  return (
    <div className="w-full px-6 py-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-8">
        <h1 className={`${lusitana.className} text-2xl font-semibold text-gray-900`}>
          
        </h1>
        <Suspense fallback={<CustomersTableSkeleton />}>
          <CustomersTable customers={customers} />
        </Suspense>
      </div>
    </div>
  );
}