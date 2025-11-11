import { useEffect, useCallback, useRef } from 'react';

import { fetchSecure } from '@/lib/fetchSecure';
import { logger } from '@/lib/errors';
import { useWeatherStore } from '@/store/useWeatherStore';

interface BackgroundUpdateBanner {
  id: string;
  cityName: string;
  newData: unknown;
  timestamp: number;
}

/**
 * Hook for background weather data refresh
 * Performs silent updates and shows banner when data changes
 */
export function useBackgroundRefresh() {
  const cities = useWeatherStore((s) => s.cities);
  const updateCity = useWeatherStore((s) => s.updateCity);
  
  const locale = useWeatherStore((s) => s.locale);
  
  const lastUpdateTimes = useRef<Map<string, number>>(new Map());
  const updateBanners = useRef<Map<string, BackgroundUpdateBanner>>(new Map());

  const refreshCityBackground = useCallback(async (cityId: string) => {
    try {
      const city = cities.find(c => c.id === cityId);
      if (!city) {
        return;
      }

      const response = await fetchSecure(
        `/api/weather?id=${cityId}&lat=${city.lat}&lon=${city.lon}&lang=${locale}`,
        {
          cache: 'no-store',
          requireAuth: true,
        },
      );

      if (!response.ok) {
        return;
      }

      const newData = await response.json();
      const lastUpdate = lastUpdateTimes.current.get(cityId);
      const newUpdateTime = new Date(newData.lastUpdatedUtc).getTime();

      // Check if data actually changed
      if (lastUpdate && newUpdateTime > lastUpdate) {
        // Store update banner for user to review
        const city = cities.find(c => c.id === cityId);
        if (city) {
          updateBanners.current.set(cityId, {
            id: cityId,
            cityName: city.name[locale],
            newData,
            timestamp: Date.now()
          });
        }
      }

      // Update the city data
      updateCity({
        ...newData,
        lastUpdated: newUpdateTime
      });

      lastUpdateTimes.current.set(cityId, newUpdateTime);

    } catch (error) {
      logger.debug('Background refresh failed', error as Error, { cityId });
    }
  }, [cities, updateCity, locale]);

  const applyBackgroundUpdate = useCallback((cityId: string) => {
    const banner = updateBanners.current.get(cityId);
    if (banner) {
      const merged = {
        ...(banner.newData as Record<string, unknown>),
        lastUpdated: banner.timestamp
      } as unknown as Parameters<typeof updateCity>[0];
      updateCity(merged);
      updateBanners.current.delete(cityId);
    }
  }, [updateCity]);

  const dismissBackgroundUpdate = useCallback((cityId: string) => {
    updateBanners.current.delete(cityId);
  }, []);

  // Background refresh logic
  useEffect(() => {
    if (cities.length === 0) return;

    const refreshInterval = setInterval(() => {
      cities.forEach(city => {
        const now = Date.now();
        const lastUpdate = city.lastUpdated;
        const timeSinceUpdate = now - lastUpdate;
        
        // Refresh if data is older than 20 minutes
        if (timeSinceUpdate > 20 * 60 * 1000) {
          refreshCityBackground(city.id);
        }
      });
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(refreshInterval);
  }, [cities, refreshCityBackground]);

  return {
    refreshCityBackground,
    applyBackgroundUpdate,
    dismissBackgroundUpdate,
    hasPendingUpdates: updateBanners.current.size > 0,
    pendingUpdates: Array.from(updateBanners.current.values())
  };
}
