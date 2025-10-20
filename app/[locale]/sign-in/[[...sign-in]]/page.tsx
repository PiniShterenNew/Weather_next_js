import { Metadata } from 'next';
import CustomSignIn from '@/features/auth/components/CustomSignIn';

export const metadata: Metadata = {
  title: 'Sign In - Weather App',
  description: 'Sign in to access your personalized weather experience',
};

export default function SignInPage() {
  return <CustomSignIn />;
}

