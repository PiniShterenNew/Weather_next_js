import { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { loadBootstrapData } from '@/lib/server/bootstrap';
import ClientHomePage from '@/features/home/components/ClientHomePage';
import CityInfoSkeleton from '@/components/skeleton/CityInfoSkeleton';
import ClientAuthGuard from '@/components/Auth/ClientAuthGuard';

export const metadata: Metadata = {
  title: 'Dashboard - Weather App',
  description: 'Personalized weather dashboard',
};

export default async function DashboardPage() {
  const { sessionId } = await auth();

  if (!sessionId) {
    redirect('/sign-in');
  }

  const bootstrapData = await loadBootstrapData();
  const locale = (bootstrapData?.user.locale ?? 'en') as 'he' | 'en';

  return (
    <ClientAuthGuard>
      <Suspense fallback={<CityInfoSkeleton />}>
        <ClientHomePage initialData={bootstrapData} locale={locale} />
      </Suspense>
    </ClientAuthGuard>
  );
}


