import { Metadata } from 'next';
import { Suspense } from 'react';
import ClientAddCityPage from '@/features/search/components/ClientAddCityPage';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Weather App - Add City',
  description: 'Search and add new cities to your weather list',
};

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AddCityPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <Suspense fallback={<Skeleton className="h-full w-full" />}>
      <ClientAddCityPage locale={locale} />
    </Suspense>
  );
}
