'use client';

import { useCallback, useState } from 'react';

import { fetchWeather } from '@/features/weather';
import { isCityDataStale, updateLastRefreshTime } from '@/lib/weatherRefresh';
import { useWeatherActions } from '@/features/weather/hooks/useWeatherActions';
import { useWeatherDataStore } from '@/features/weather/store/useWeatherDataStore';
import { useToastStore } from '@/features/ui/store/useToastStore';
import type { CityWeather } from '@/types/weather';

interface RefreshOptions {
  force?: boolean;
}

export const useCityRefresh = () => {
  const showToast = useToastStore((state) => state.showToast);
  const updateCity = useWeatherDataStore((state) => state.updateCity);
  const { refreshCity } = useWeatherActions();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshCityIfNeeded = useCallback(
    async (city: CityWeather, options: RefreshOptions = {}) => {
      const { force = false } = options;
      const isStale = isCityDataStale(city);

      if (!isStale && !force) {
        return;
      }

      if (isRefreshing) {
        return;
      }

      setIsRefreshing(true);
      try {
        const freshData = await fetchWeather({
          id: city.id,
          lat: city.lat,
          lon: city.lon,
          unit: city.unit,
        });

        updateCity({ ...freshData, lastUpdated: Date.now() });
        updateLastRefreshTime(city.id);

        if (force) {
          showToast({
            message: 'toasts.refreshed',
            type: 'success',
            values: { city: city.name.he || city.name.en },
          });
        }
      } catch {
        showToast({ message: 'toasts.error', type: 'error' });
        updateCity(city);
        refreshCity(city.id);
      } finally {
        setIsRefreshing(false);
      }
    },
    [showToast, updateCity, refreshCity, isRefreshing],
  );

  return { refreshCityIfNeeded, isRefreshing };
};


