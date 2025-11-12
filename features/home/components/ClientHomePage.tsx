'use client';

import { useEffect } from 'react';
import { useWeatherStore } from '@/store/useWeatherStore';
import dynamic from 'next/dynamic';
import CityInfoSkeleton from '../skeleton/CityInfoSkeleton';
import EmptyPage from '@/features/ui/components/EmptyPage';
import { getWeatherBackground, isNightTime } from '@/lib/helpers';
import { useBackgroundRefresh } from '@/hooks/useBackgroundRefresh';
import { useUserSync } from '@/hooks/useUserSync';
import BackgroundUpdateBanner from '@/components/ui/BackgroundUpdateBanner';

const WeatherCarousel = dynamic(() => import('@/features/weather/components/WeatherCarousel'), {
  loading: () => <CityInfoSkeleton />,
  ssr: true,
});

const CityPagination = dynamic(() => import('@/features/weather/components/card/CityPagination'), {
  loading: () => null,
  ssr: true,
});

import { BootstrapData } from '@/lib/server/bootstrap';

interface ClientHomePageProps {
  initialData: BootstrapData | null;
  locale: 'he' | 'en';
}

export default function ClientHomePage({ initialData }: ClientHomePageProps) {
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

  // Show loading state only for critical user sync operations
  if (isChecking) {
    return (
      <div className="h-full">
        <div className="h-full flex flex-col w-full px-2 md:px-4 xl:px-6 pt-2">
          <div className="flex-1 flex items-center justify-center">
            <CityInfoSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full bg-cover bg-center bg-no-repeat transition-all duration-1000 ${backgroundClass}`}>
      {/* Background Update Banners */}
      {pendingUpdates.map(update => (
        <BackgroundUpdateBanner
          key={update.id}
          cityName={update.cityName}
          onApply={() => applyBackgroundUpdate(update.id)}
          onDismiss={() => dismissBackgroundUpdate(update.id)}
        />
      ))}
      
      <div className="h-full flex flex-col w-full px-2 md:px-4 xl:px-6 pt-2">
        {isLoading && (
          <div data-testid="loading-overlay" className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
        {cities.length > 0 ? (
          <>
            {/* Weather Card - Takes remaining space minus pagination */}
            <div className="flex-1 min-h-0" data-testid="weather-list">
              <WeatherCarousel />
            </div>
            
            {/* Pagination - Fixed at Bottom, closer to the card */}
            <div className="flex-shrink-0 mt-1">
              <CityPagination />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyPage />
          </div>
        )}
      </div>
    </div>
  );
}
