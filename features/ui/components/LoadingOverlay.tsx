'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { useWeatherStore } from '@/store/useWeatherStore';
import type { LoadingOverlayProps } from '@/features/ui/types';

const HIDE_DELAY_MS = 250;

const LoadingOverlay = ({ isLoading, message, className }: LoadingOverlayProps) => {
  const t = useTranslations();
  const storeLoading = useWeatherStore((s) => s.isLoading);
  const isBusy = Boolean(isLoading || storeLoading);
  const [isVisible, setIsVisible] = useState(isBusy);

  useEffect(() => {
    if (isBusy) {
      setIsVisible(true);
      return;
    }
    const timeout = window.setTimeout(() => setIsVisible(false), HIDE_DELAY_MS);
    return () => window.clearTimeout(timeout);
  }, [isBusy]);

  if (!isVisible && !isBusy) {
    return null;
  }

  const statusLabel = message || t('loading');

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[999] flex justify-center px-4">
      <div
        data-testid="loading-overlay"
        className={`mt-2 flex w-full max-w-4xl items-center gap-3 rounded-full bg-gray-900/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-lg backdrop-blur transition-all duration-200 ${
          isBusy ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        } ${className ?? ''}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/30">
          <span className="block h-full w-full animate-[pulse_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-sky-400" />
        </div>
        <span>{statusLabel}</span>
      </div>
    </div>
  );
};

export default LoadingOverlay;
