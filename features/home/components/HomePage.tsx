'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import CityInfoSkeleton from '@/components/skeleton/CityInfoSkeleton';
import EmptyPage from '@/features/ui/components/EmptyPage';
import { getWeatherBackground, isNightTime } from '@/lib/helpers';
import { useWeatherStore } from '@/store/useWeatherStore';

const SwipeableWeatherCard = dynamic(() => import('@/features/weather/components/card/SwipeableWeatherCard'), {
  loading: () => <div className="w-full h-full" aria-hidden="true" />,
  ssr: true,
});

const CityPagination = dynamic(() => import('@/features/weather/components/card/CityPagination'), {
  loading: () => <div className="h-11 w-full" aria-hidden="true" />,
  ssr: true,
});


export default function HomePage() {
  const t = useTranslations();
  const [hasShownSlowNetworkWarning, setHasShownSlowNetworkWarning] = useState(false);

  const cities = useWeatherStore((s) => s.cities);
  const currentIndex = useWeatherStore((s) => s.currentIndex);
  const isLoading = useWeatherStore((s) => s.isLoading);
  const showToast = useWeatherStore((s) => s.showToast);

  // Slow network warning logic
  useEffect(() => {
    if (!isLoading) {
      setHasShownSlowNetworkWarning(false);
      return;
    }

    const slowNetworkTimer = setTimeout(() => {
      if (isLoading && !hasShownSlowNetworkWarning) {
        setHasShownSlowNetworkWarning(true);
        showToast({
          message: 'toasts.slowNetwork',
          type: 'warning',
          duration: 8000,
        });
      }
    }, 5000);

    return () => {
      clearTimeout(slowNetworkTimer);
    };
  }, [isLoading, hasShownSlowNetworkWarning, showToast]);

  // Get background based on current city's weather
  const currentCity = cities[currentIndex];
  const weatherCode = currentCity?.current?.codeId || 800;
  const sunrise = currentCity?.current?.sunrise || 0;
  const sunset = currentCity?.current?.sunset || 0;
  const currentTime = Math.floor(Date.now() / 1000);
  
  const isNight = isNightTime(currentTime, sunrise, sunset);
  const backgroundClass = getWeatherBackground(weatherCode, isNight);
  const showInlineLoader = isLoading && cities.length > 0;
  const paginationMinHeight = cities.length > 1 ? '44px' : '0px';

  // Removed unnecessary hydration delay for better performance

  return (
    <div className={`h-full bg-cover bg-center bg-no-repeat ${backgroundClass}`}>
      <div className="relative h-full flex flex-col w-full px-2 md:px-4 xl:px-6 pt-2 max-w-3xl mx-auto">
        {cities.length > 0 ? (
          <>
            {/* Weather Card - Takes remaining space minus pagination */}
            <div className="relative flex-1 min-h-0 mb-2" data-testid="weather-list" aria-busy={isLoading}>
              {showInlineLoader && (
                <div
                  data-testid="loading-overlay"
                  className="pointer-events-none absolute top-3 right-3 z-30 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white shadow-lg backdrop-blur-sm"
                  role="status"
                  aria-live="polite"
                >
                  <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                  <span>{t('loading')}</span>
                </div>
              )}
              <SwipeableWeatherCard />
            </div>
            
            {/* Pagination - Fixed at Bottom */}
            <div className="flex-shrink-0" style={{ minHeight: paginationMinHeight }} aria-live="polite">
              {cities.length > 1 ? <CityPagination /> : null}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            {isLoading ? <CityInfoSkeleton /> : <EmptyPage />}
          </div>
        )}
      </div>
    </div>
  );
}