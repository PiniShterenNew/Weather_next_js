import { useEffect, useCallback } from 'react';
import { useWeatherStore } from '@/store/useWeatherStore';
import { shouldAutoRefresh } from '@/lib/weatherRefresh';
import { fetchWeather } from '@/features/weather';

/**
 * Hook for automatically refreshing stale weather data
 * Runs in background and updates cities when data is stale
 */
export function useAutoRefreshWeather() {
  const cities = useWeatherStore((s) => s.cities);
  const updateCity = useWeatherStore((s) => s.updateCity);
  const showToast = useWeatherStore((s) => s.showToast);

  const refreshStaleCities = useCallback(async () => {
    const staleCities = cities.filter(shouldAutoRefresh);
    
    if (staleCities.length === 0) return;

    // Batch refresh cities for better performance (3 at a time)
    const BATCH_SIZE = 3;
    for (let i = 0; i < staleCities.length; i += BATCH_SIZE) {
      const batch = staleCities.slice(i, i + BATCH_SIZE);
      
      const refreshPromises = batch.map(async (city) => {
        try {
          const freshData = await fetchWeather({
            id: city.id,
            lat: city.lat,
            lon: city.lon,
            unit: city.unit || 'metric',
          });

          updateCity({ ...freshData, lastUpdated: Date.now() });
        } catch {
          // Failed to refresh weather for city
          // Don't show toast for background refresh failures
          // Only update lastUpdated to prevent immediate retry
          updateCity({ ...city, lastUpdated: Date.now() });
        }
      });

      await Promise.allSettled(refreshPromises);
      
      // Small delay between batches to avoid overwhelming the API
      if (i + BATCH_SIZE < staleCities.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }, [cities, updateCity, showToast]);

  useEffect(() => {
    if (cities.length === 0) return;

    // Initial refresh check
    refreshStaleCities();

    // Set up interval for periodic refresh (every 5 minutes for better UX)
    const interval = setInterval(refreshStaleCities, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refreshStaleCities]);

  return { refreshStaleCities };
}
