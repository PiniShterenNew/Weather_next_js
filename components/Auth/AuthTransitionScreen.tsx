'use client';

import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';

interface AuthTransitionScreenProps {
  mode: 'signing-in' | 'signing-out';
}

export default function AuthTransitionScreen({ mode }: AuthTransitionScreenProps) {
  const t = useTranslations();
  const title =
    mode === 'signing-in'
      ? t('auth.signingIn')
      : t('auth.signingOut');

  const descKey =
    mode === 'signing-in' ? 'auth.signingInDescription' : 'auth.signingOutDescription';

  let desc: string;
  try {
    desc = t(descKey);
  } catch {
    desc = t('loading');
  }

  return (
    <div className="min-h-[60vh] w-full max-w-3xl mx-auto flex flex-col items-center justify-center gap-4 px-6">
      <div className="rounded-2xl border border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur p-8 w-full text-center">
        <div className="flex items-center justify-center mb-4">
          <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
        </div>
        <h1 className="text-xl font-semibold text-neutral-800 dark:text-white/90">
          {title}
        </h1>
        <p className="text-sm text-neutral-600 dark:text-white/80 mt-2">
          {desc}
        </p>
      </div>
    </div>
  );
}


