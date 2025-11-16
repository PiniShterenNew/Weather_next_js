import { Metadata } from 'next';
import { Suspense } from 'react';
import SettingsPage from '@/features/settings/pages/SettingsPage';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Settings - Weather App',
  description: 'Manage your preferences and settings',
};

export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-full w-full" />}>
      <SettingsPage />
    </Suspense>
  );
}

