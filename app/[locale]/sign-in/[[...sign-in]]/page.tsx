import { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import CustomSignIn from '@/features/auth/components/CustomSignIn';

export const metadata: Metadata = {
  title: 'Sign In - Weather App',
  description: 'Sign in to access your personalized weather experience',
};

interface SignInPageProps {
  params: Promise<{ locale: string }>;
}

export default async function SignInPage({ params }: SignInPageProps) {
  const { locale } = await params;
  const { sessionId } = await auth();

  if (sessionId) {
    redirect(`/${locale}`);
  }

  return <CustomSignIn />;
}

