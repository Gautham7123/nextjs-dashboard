import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/invoices/table';
import { CreateInvoice } from '@/app/ui/invoices/buttons';
import { lusitana } from '@/app/ui/fonts';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { fetchInvoicesPages } from '@/app/lib/data';

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query?.toString() ?? '';
  const currentPage = Number(searchParams?.page?.toString()) || 1;
  const totalPages = await fetchInvoicesPages(query);

  return (
    <div className="w-full px-6 py-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className={`${lusitana.className} text-2xl font-semibold text-gray-900`}>
            Invoices
          </h1>
          <CreateInvoice />
        </div>

        <div className="flex w-full items-center justify-between gap-2">
          <Search placeholder="Search invoices..." />
        </div>

        <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
          <Table query={query} currentPage={currentPage} />
        </Suspense>

        <div className="mt-5 flex justify-center">
          <Pagination totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}