import { Metadata } from 'next';
import { Suspense } from 'react';
import { Welcome } from '@/features/onboarding';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Welcome - Weather App',
  description: 'Welcome to the weather application',
};

export default function WelcomePage() {
  return (
    <Suspense fallback={<Skeleton className="h-full w-full" />}>
      <Welcome />
    </Suspense>
  );
}
