import { Metadata } from 'next';
import ClientHomePage from '@/features/home/components/ClientHomePage';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Weather App - Home',
  description: 'Check current weather and forecasts for cities around the world',
};

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;

  return (
    <Suspense fallback={null}>
      <ClientHomePage 
        initialData={null}
        locale={locale as 'he' | 'en'}
      />
    </Suspense>
  );
}