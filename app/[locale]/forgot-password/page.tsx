import { Metadata } from 'next';
import { Suspense } from 'react';
import ForgotPassword from '@/features/auth/components/ForgotPassword';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Forgot Password - Weather App',
  description: 'Reset your password',
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<Skeleton className="h-full w-full" />}>
      <ForgotPassword />
    </Suspense>
  );
}

