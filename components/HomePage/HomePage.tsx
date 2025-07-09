/**
 * HomePage component that displays the weather application UI
 * Contains the weather cards, city information, and control elements
 * This is a client component that uses Zustand for state management
 *
 * @returns {JSX.Element} The HomePage component
 */
'use client';

import { QuickCityAddModal } from '@/components/QuickAdd/QuickCityAddModal';
import { useWeatherStore } from '@/stores/useWeatherStore';
import SettingsModal from '@/components/Settings/SettingsModal';
import LoadingOverlay from '@/components/LoadingOverlay';
import { Suspense, useEffect, useState } from 'react';
import AddLocation from '@/components/QuickAdd/AddLocation.lazy';
import WeatherList from '@/components/WeatherList/WeatherList.lazy';
import CityInfo from '@/components/WeatherCard/CityInfo.lazy';
import EmptyPage from '@/components/EmptyPage/EmptyPage.lazy';

/**
 * Main HomePage component that displays the weather application UI
 * Contains the weather cards, city information, and control elements
 * This is a client component that uses Zustand for state management
 */
export default function HomePage() {
  const cities = useWeatherStore((s) => s.cities);
  const isLoading = useWeatherStore((s) => s.isLoading);
  const showToast = useWeatherStore((s) => s.showToast);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasShownSlowNetworkWarning, setHasShownSlowNetworkWarning] = useState(false);
  const autoLocationCityId = useWeatherStore((s) => s.autoLocationCityId);

  /**
   * Effect to handle initialization and slow network warning
   * Shows a toast if loading takes too long
   */
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
  }, []);

  /**
   * Reset slow network warning when loading completes
   */
  useEffect(() => {
    if (!isInitializing && !isLoading) {
      setHasShownSlowNetworkWarning(false);
    }
  }, [isInitializing, isLoading]);
  
  return (
    <main className="min-h-screen w-full px-6 py-4 flex flex-col gap-6">
      <div className="w-full flex justify-between items-center">
        <div className="flex gap-2 flex-row">
          <QuickCityAddModal />
          {!autoLocationCityId && (
            <AddLocation size="icon" type="icon" />
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