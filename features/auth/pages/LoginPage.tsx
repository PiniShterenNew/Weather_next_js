'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import SignInButtons from '../components/SignInButtons';
import type { LoginPageProps } from '../types';
import { Thermometer } from 'lucide-react';

export default function LoginPage({ redirectUrl: _redirectUrl = '/' }: LoginPageProps) {
  const t = useTranslations();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-500 to-brand-600 p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        {/* Logo & Title */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-brand-600">
            <Thermometer className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('app.title')}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {t('auth.loginDescription')}
            </p>
          </div>
        </div>

        {/* Sign In Buttons */}
        <SignInButtons />

        {/* Terms */}
        <p className="text-xs text-center text-gray-600 dark:text-gray-400">
          {t('auth.termsAgreement')}
        </p>
      </Card>
    </div>
  );
}

