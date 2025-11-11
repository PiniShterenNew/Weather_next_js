import { Metadata } from 'next';
import MagicLinkSignIn from '@/features/auth/components/MagicLinkSignIn';

export const metadata: Metadata = {
  title: 'Magic Link Sign In - Weather App',
  description: 'Sign in with a magic link sent to your email',
};

export default function MagicLinkSignInPage() {
  return <MagicLinkSignIn />;
}

