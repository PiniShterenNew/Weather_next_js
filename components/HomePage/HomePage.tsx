'use client';

import { useWeatherStore } from '@/store/useWeatherStore';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import CityInfoSkeleton from '../skeleton/CityInfoSkeleton';
import EmptyPage from '../EmptyPage/EmptyPage';
import { getWeatherBackground, isNightTime } from '@/lib/helpers';



const SwipeableWeatherCard = dynamic(() => import('@/features/weather/components/card/SwipeableWeatherCard'), {
  loading: () => <CityInfoSkeleton />,
  ssr: true,
});

const CityPagination = dynamic(() => import('@/features/weather/components/card/CityPagination'), {
  loading: () => null,
  ssr: true,
});


export default function HomePage() {
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

  // Removed unnecessary hydration delay for better performance

  return (
    <div className={`h-full bg-cover bg-center bg-no-repeat transition-all duration-1000 ${backgroundClass}`}>
      <div className="h-full flex flex-col w-full px-2 md:px-4 xl:px-6 pt-2">
        {isLoading && (
          <div data-testid="loading-overlay" className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
        {cities.length > 0 ? (
          <>
            {/* Weather Card - Takes remaining space minus pagination */}
            <div className="flex-1 min-h-0 mb-2" data-testid="weather-list">
              <SwipeableWeatherCard />
            </div>
            
            {/* Pagination - Fixed at Bottom */}
            <div className="flex-shrink-0">
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