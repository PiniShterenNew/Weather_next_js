import { Metadata } from 'next';
import { Suspense } from 'react';
import ClientSSOCallback from '@/features/auth/components/ClientSSOCallback';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Signing In - Weather App',
  description: 'Completing sign in',
};

export default function SSOCallback() {
  return (
    <Suspense fallback={<Skeleton className="h-full w-full" />}>
      <ClientSSOCallback />
    </Suspense>
  );
}

