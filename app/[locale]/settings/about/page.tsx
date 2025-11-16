import { Metadata } from 'next';
import { Suspense } from 'react';
import ClientAboutPage from '@/features/settings/components/ClientAboutPage';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'About - Weather App',
  description: 'About this weather application',
};

export default function AboutPage() {
  return (
    <Suspense fallback={<Skeleton className="h-full w-full" />}>
      <ClientAboutPage />
    </Suspense>
  );
}
