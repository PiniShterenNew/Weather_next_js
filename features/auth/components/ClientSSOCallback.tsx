'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';

export default function ClientSSOCallback() {
  const t = useTranslations('auth');

  return (
    <>
      <AuthenticateWithRedirectCallback />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-500 to-brand-600">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-white mx-auto" />
          <p className="text-white text-lg font-medium">{t('completingSignIn')}</p>
        </div>
      </div>
    </>
  );
}

