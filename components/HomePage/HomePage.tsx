'use client';

import { useWeatherStore } from '@/store/useWeatherStore';
import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import CityInfoSkeleton from '../skeleton/CityInfoSkeleton';
import EmptyPageSkeleton from '../skeleton/EmptyPageSkeleton';
import { getWeatherBackground, isNightTime } from '@/lib/helpers';

const EmptyPage = dynamic(() => import('@/components/EmptyPage/EmptyPage').then((module) => module.default), {
  loading: () => (
    <EmptyPageSkeleton />
  ),
  ssr: false,
});



const SwipeableWeatherCard = dynamic(() => import('@/components/WeatherCard/SwipeableWeatherCard').then((module) => module.default), {
  loading: () => (
    <CityInfoSkeleton />
  ),
  ssr: false,
});

const CityPagination = dynamic(() => import('@/components/WeatherCard/CityPagination').then((module) => module.default), {
  loading: () => null,
  ssr: false,
});


export default function HomePage() {
  const cities = useWeatherStore((s) => s.cities);
  const currentIndex = useWeatherStore((s) => s.currentIndex);
  const isLoading = useWeatherStore((s) => s.isLoading);
  const showToast = useWeatherStore((s) => s.showToast);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasShownSlowNetworkWarning, setHasShownSlowNetworkWarning] = useState(false);


  useEffect(() => {
    // Faster initialization for better perceived performance
    const initTimer = setTimeout(() => {
      setIsInitializing(false);
    }, 50); // Reduced from 100ms to 50ms

    const slowNetworkTimer = setTimeout(() => {
      if ((isInitializing || isLoading) && !hasShownSlowNetworkWarning) {
        setHasShownSlowNetworkWarning(true);
        showToast({
          message: 'toasts.slowNetwork',
          type: 'warning',
          duration: 8000
        });
      }
    }, 3000); // Reduced from 5000ms to 3000ms for faster feedback

    return () => {
      clearTimeout(initTimer);
      clearTimeout(slowNetworkTimer);
    };
  }, [hasShownSlowNetworkWarning, isInitializing, isLoading, showToast]);


  useEffect(() => {
    if (!isInitializing && !isLoading) {
      setHasShownSlowNetworkWarning(false);
    }
  }, [isInitializing, isLoading, hasShownSlowNetworkWarning, showToast]);

  // Get background based on current city's weather
  const currentCity = cities[currentIndex];
  const weatherCode = currentCity?.currentEn?.current?.codeId || 800;
  const sunrise = currentCity?.currentEn?.current?.sunrise || 0;
  const sunset = currentCity?.currentEn?.current?.sunset || 0;
  const currentTime = Math.floor(Date.now() / 1000);
  
  const isNight = isNightTime(currentTime, sunrise, sunset);
  const backgroundClass = getWeatherBackground(weatherCode, isNight);

  return (
    <div className={`h-full bg-cover bg-center bg-no-repeat transition-all duration-1000 ${backgroundClass}`}>
      <div className="h-full flex flex-col container mx-auto max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl 2xl:max-w-4xl px-2 md:px-4 xl:px-6 pt-2">
        {isLoading && (
          <div data-testid="loading-overlay" className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
        {cities.length > 0 ? (
          <>
            {/* Weather Card - Takes remaining space minus pagination */}
            <div className="flex-1 min-h-0 mb-2" data-testid="weather-list">
              <Suspense>
                <SwipeableWeatherCard />
              </Suspense>
            </div>
            
            {/* Pagination - Fixed at Bottom */}
            <div className="flex-shrink-0">
              <CityPagination />
            </div>
          </>
        ) : (
          <EmptyPage />
        )}
      </div>
    </div>
  );
}