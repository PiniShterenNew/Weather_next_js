'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { useWeatherStore } from '@/store/useWeatherStore';
import dynamic from 'next/dynamic';
import CityInfoSkeleton from '@/components/skeleton/CityInfoSkeleton';
import EmptyPage from '@/features/ui/components/EmptyPage';
import { getWeatherBackground, isNightTime } from '@/lib/helpers';
import { useBackgroundRefresh } from '@/hooks/useBackgroundRefresh';
import { useUserSync } from '@/hooks/useUserSync';
import BackgroundUpdateBanner from '@/components/ui/BackgroundUpdateBanner';
import CityPaginationSkeleton from '@/features/weather/components/card/CityPaginationSkeleton';

const WeatherCarousel = dynamic(() => import('@/features/weather/components/WeatherCarousel'), {
  loading: () => <CityInfoSkeleton />,
  ssr: true,
});

const CityPagination = dynamic(() => import('@/features/weather/components/card/CityPagination'), {
  loading: () => <CityPaginationSkeleton />,
  ssr: true,
});

import { BootstrapData } from '@/lib/server/bootstrap';

interface ClientHomePageProps {
  initialData: BootstrapData | null;
  locale: 'he' | 'en';
}

export default function ClientHomePage({ initialData, locale }: ClientHomePageProps) {
  const t = useTranslations();
  // User sync hook - checks if user exists in database
  const { isChecking } = useUserSync();
  
  // Background refresh hook
  const { 
    pendingUpdates, 
    applyBackgroundUpdate, 
    dismissBackgroundUpdate 
  } = useBackgroundRefresh();

  // Initialize store with server data
  useEffect(() => {
    if (initialData) {
      const { cities, currentCityId, user } = initialData;
      useWeatherStore.getState().loadFromServer({
        cities,
        currentCityId: currentCityId ?? undefined,
        user,
      });
    }
  }, [initialData]);

  const cities = useWeatherStore((s) => s.cities);
  const currentIndex = useWeatherStore((s) => s.currentIndex);
  const isLoading = useWeatherStore((s) => s.isLoading);

  // Get background based on current city's weather
  const currentCity = cities[currentIndex];
  const weatherCode = currentCity?.current?.codeId || 800;
  const sunrise = currentCity?.current?.sunrise || 0;
  const sunset = currentCity?.current?.sunset || 0;
  const currentTime = Math.floor(Date.now() / 1000);
  
  const isNight = isNightTime(currentTime, sunrise, sunset);
  const backgroundClass = getWeatherBackground(weatherCode, isNight);

  const direction = locale === 'he' ? 'rtl' : 'ltr';

  // Show loading state only for critical user sync operations
  if (isChecking) {
    return (
      <div className="h-full" dir={direction}>
        <div className="h-full flex flex-col w-full px-2 md:px-4 xl:px-6 pt-2">
          <div className="flex-1 flex items-center justify-center">
            <CityInfoSkeleton />
          </div>
        </div>
      </div>
    );
  }

  const showInlineLoader = isLoading && cities.length > 0;
  const paginationMinHeight = cities.length > 1 ? '44px' : '0px';

  return (
    <div
      className={`h-full bg-cover bg-center bg-no-repeat transition-all duration-1000 ${backgroundClass}`}
      dir={direction}
    >
      {/* Background Update Banners */}
      {pendingUpdates.map(update => (
        <BackgroundUpdateBanner
          key={update.id}
          cityName={update.cityName}
          onApply={() => applyBackgroundUpdate(update.id)}
          onDismiss={() => dismissBackgroundUpdate(update.id)}
        />
      ))}
      
      <div className="relative h-full flex flex-col w-full px-2 md:px-4 xl:px-6 pt-2">
        {cities.length > 0 ? (
          <>
            {/* Weather Card - Takes remaining space minus pagination */}
            <div className="relative flex-1 min-h-0" data-testid="weather-list" aria-busy={isLoading}>
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
              <WeatherCarousel />
            </div>
            
            {/* Pagination - Fixed at Bottom, closer to the card */}
            <div className="flex-shrink-0 mt-1" style={{ minHeight: paginationMinHeight }} aria-live="polite">
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
