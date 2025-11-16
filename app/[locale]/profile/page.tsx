import { Metadata } from 'next';
import { Suspense } from 'react';
import ClientProfilePage from '@/features/auth/components/ClientProfilePage';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Profile - Weather App',
  description: 'Manage your profile and account settings',
};

export default function ProfilePage() {
  return (
    <Suspense fallback={<Skeleton className="h-full w-full" />}>
      <ClientProfilePage />
    </Suspense>
  );
}
