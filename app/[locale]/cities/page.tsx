import { Metadata } from 'next';
import { Suspense } from 'react';
import ClientCitiesPage from '@/features/cities/components/ClientCitiesPage';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Weather App - Cities',
  description: 'View and manage your saved cities',
};

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function CitiesPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <Suspense fallback={<Skeleton className="h-full w-full" />}>
      <ClientCitiesPage locale={locale} />
    </Suspense>
  );
}