'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

export function QuickAddHeaderTrigger() {
  const t = useTranslations();
  const router = useRouter();

  return (
    <button
      data-testid="quick-add-header-button"
      title={t('search.quickAdd')}
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-full h-10 w-10 flex items-center justify-center hover-scale transition-all duration-200 shadow-lg hover:shadow-xl text-brand-500 dark:text-brand-400 font-bold text-2xl"
      onClick={() => router.push('/add-city')}
      aria-label={t('search.quickAdd')}
    >
      +
    </button>
  );
}
