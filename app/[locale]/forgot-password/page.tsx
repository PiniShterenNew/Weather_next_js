import { Metadata } from 'next';
import ForgotPassword from '@/features/auth/components/ForgotPassword';

export const metadata: Metadata = {
  title: 'Forgot Password - Weather App',
  description: 'Reset your password',
};

export default function ForgotPasswordPage() {
  return <ForgotPassword />;
}

