'use client';

import { QuickCityAddModal } from '@/components/QuickAdd/QuickCityAddModal';
import { useWeatherStore } from '@/stores/useWeatherStore';
import SettingsModal from '@/components/Settings/SettingsModal';
import LoadingOverlay from '@/components/LoadingOverlay';
import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import WeatherListSkeleton from '@/components/skeleton/WeatherListSkeleton';
import CityInfoSkeleton from '../skeleton/CityInfoSkeleton';
import EmptyPageSkeleton from '../skeleton/EmptyPageSkeleton';

const EmptyPage = dynamic(() => import('@/components/EmptyPage/EmptyPage').then((module) => module.default), {
  loading: () => (
    <EmptyPageSkeleton />
  ),
  ssr: false,
});

const AddLocation = dynamic(() => import('@/components/QuickAdd/AddLocation').then((module) => module.default), {
  loading: () => (
    <Skeleton className="h-10 w-full" />
  ),
});

const WeatherList = dynamic(() => import('@/components/WeatherList/WeatherList').then((module) => module.default), {
  loading: () => (
    <WeatherListSkeleton />
  ),
  ssr: false,
});

const CityInfo = dynamic(() => import('@/components/WeatherCard/CityInfo').then((module) => module.default), {
  loading: () => (
    <CityInfoSkeleton />
  ),
  ssr: false,
});


export default function HomePage() {
  const cities = useWeatherStore((s) => s.cities);
  const isLoading = useWeatherStore((s) => s.isLoading);
  const showToast = useWeatherStore((s) => s.showToast);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasShownSlowNetworkWarning, setHasShownSlowNetworkWarning] = useState(false);
  const autoLocationCityId = useWeatherStore((s) => s.autoLocationCityId);


  useEffect(() => {
    const initTimer = setTimeout(() => {
      setIsInitializing(false);
    }, 100);

    const slowNetworkTimer = setTimeout(() => {
      if ((isInitializing || isLoading) && !hasShownSlowNetworkWarning) {
        setHasShownSlowNetworkWarning(true);
        showToast({
          message: 'toasts.slowNetwork',
          type: 'warning',
          duration: 8000
        });
      }
    }, 5000);

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

  return (
    <main className="min-h-screen w-full px-6 py-4 flex flex-col gap-6">
      <div className="w-full flex justify-between items-center">
        <div className="flex gap-2 flex-row">
          <QuickCityAddModal />
          {!autoLocationCityId && (
            <AddLocation size="icon" type="icon" dataTestid="add-location-icon" />
          )}
        </div>

        <SettingsModal />
      </div>

      <div className="w-full flex flex-row gap-6 items-start">
        {cities.length > 0 && (
          <>
            <div className="w-1/4">
              <WeatherList />
            </div>
            <div className="w-3/4 flex flex-col gap-6">
              <Suspense>
                <CityInfo />
              </Suspense>
            </div>
          </>
        )}
        {!cities.length && <EmptyPage />}
      </div>

      <LoadingOverlay isLoading={isInitializing || isLoading} />
    </main>
  );
}