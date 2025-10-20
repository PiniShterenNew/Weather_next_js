'use client';

import { useWeatherStore } from '@/store/useWeatherStore';
import { useTranslations } from 'next-intl';

type Props = {
  isLoading?: boolean;
};

const LoadingOverlay = ({ isLoading }: Props) => {
  const t = useTranslations();
  const isLoadingFlag = useWeatherStore((s) => s.isLoading);

  if (!isLoadingFlag && !isLoading) return null;

  return (
    <div
      className="fixed inset-0 z-[999] bg-background/80 backdrop-blur-sm flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="loading-text"
    >
      <div className="bg-card p-8 rounded-xl shadow-xl border border-border">
        <div className="flex flex-col items-center gap-4">
          <div
            data-testid="spinner"
            className="animate-spin rounded-full h-12 w-12 border-4 border-muted border-t-brand-500"
            role="img"
            aria-label={t('loading')}
          />
          <p className="text-lg font-medium text-card-foreground" id="loading-text">{t('loading')}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
