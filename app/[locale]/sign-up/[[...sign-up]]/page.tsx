import { Metadata } from 'next';
import CustomSignUp from '@/features/auth/components/CustomSignUp';

export const metadata: Metadata = {
  title: 'Sign Up - Weather App',
  description: 'Create an account to save your weather preferences',
};

export default function SignUpPage() {
  return <CustomSignUp />;
}

