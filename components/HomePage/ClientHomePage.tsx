'use client';

import { useEffect } from 'react';
import { useWeatherStore } from '@/store/useWeatherStore';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import CityInfoSkeleton from '../skeleton/CityInfoSkeleton';
import EmptyPage from '../EmptyPage/EmptyPage';
import { getWeatherBackground, isNightTime } from '@/lib/helpers';
import { CityWeather } from '@/types/weather';

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

interface InitialData {
  user: {
    id: string;
    clerkId: string;
    email: string | null;
    name: string | null;
    preferences: {
      locale?: string;
      theme?: string;
      unit?: string;
    } | null;
  } | null;
  cities: Array<{
    id: string;
    lat: number;
    lon: number;
    name: {
      en: string;
      he: string;
    };
    country: {
      en: string;
      he: string;
    };
  }>;
  currentWeather: CityWeather | null;
  locale: 'he' | 'en';
}

interface ClientHomePageProps {
  initialData: InitialData | null;
}

export default function ClientHomePage({ initialData }: ClientHomePageProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Initialize store with server data
  useEffect(() => {
    if (initialData) {
      useWeatherStore.setState({
        cities: initialData.cities.map(city => ({
          ...city,
          current: initialData.currentWeather?.current || {
            codeId: 800,
            temp: 20,
            feelsLike: 20,
            tempMin: 15,
            tempMax: 25,
            desc: 'Clear',
            icon: '01d',
            humidity: 50,
            wind: 5,
            windDeg: 0,
            pressure: 1013,
            visibility: 10000,
            clouds: 0,
            sunrise: 0,
            sunset: 0,
            timezone: 0
          },
          forecast: initialData.currentWeather?.forecast || [],
          hourly: initialData.currentWeather?.hourly || [],
          lastUpdated: initialData.currentWeather?.lastUpdated || 0,
          unit: 'metric'
        })),
        currentIndex: 0,
        locale: initialData.locale,
        theme: (initialData.user?.preferences?.theme as 'light' | 'dark' | 'system') || 'system',
        unit: (initialData.user?.preferences?.unit as 'metric' | 'imperial') || 'metric',
        isAuthenticated: !!initialData.user
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

  // Show loading state until component is mounted to prevent hydration mismatch
  if (!isHydrated) {
    return (
      <div className="h-full bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="h-full flex flex-col w-full px-2 md:px-4 xl:px-6 pt-2">
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    );
  }

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
