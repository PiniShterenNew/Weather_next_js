'use client';

import { useWeatherStore } from '@/stores/useWeatherStore';
import { useTranslations } from 'next-intl';

type Props = {
  isLoading?: boolean;
};

const LoadingOverlay = ({ isLoading }: Props) => {
  const t = useTranslations();
  const isLoadingFlag = useWeatherStore((s) => s.isLoading);

  if (!isLoadingFlag && !isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-lg font-medium"> {t('loading')}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
