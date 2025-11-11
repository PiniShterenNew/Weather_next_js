import { Metadata } from 'next';
import { loadBootstrapData } from '@/lib/server/bootstrap';
import { redirect } from 'next/navigation';
import ClientHomePage from '@/components/HomePage/ClientHomePage';
import { Suspense } from 'react';
import CityInfoSkeleton from '@/components/skeleton/CityInfoSkeleton';

export const metadata: Metadata = {
  title: 'Weather App - Home',
  description: 'Check current weather and forecasts for cities around the world',
};

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  
  // Load bootstrap data for SSR
  const bootstrapData = await loadBootstrapData();

  // If user prefers a different locale, redirect to it
  if (bootstrapData && bootstrapData.user?.locale && bootstrapData.user.locale !== (locale as 'he' | 'en')) {
    redirect(`/${bootstrapData.user.locale}`);
  }

  return (
    <Suspense fallback={<CityInfoSkeleton />}>
      <ClientHomePage 
        initialData={bootstrapData}
        locale={locale as 'he' | 'en'}
      />
    </Suspense>
  );
}