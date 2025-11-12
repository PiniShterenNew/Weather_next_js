import { useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSecure } from '@/lib/fetchSecure';
import { fetchWeather } from '@/features/weather';
import { useWeatherActions } from '@/features/weather/hooks/useWeatherActions';
import { useAppPreferencesStore } from '@/store/useAppPreferencesStore';
import { useWeatherStore } from '@/store/useWeatherStore';
import type { CityWeather } from '@/types/weather';
import type { TemporaryUnit } from '@/types/ui';

export interface UseLocationRefreshReturn {
  isRefreshingLocation: boolean;
  handleRefreshLocation: (e?: ReactMouseEvent) => Promise<void>;
}

export function useLocationRefresh(): UseLocationRefreshReturn {
  const router = useRouter();
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);
  const updateCurrentLocation = useWeatherStore((s) => s.updateCurrentLocation);
  const showToast = useWeatherStore((s) => s.showToast);
  const preferences = useAppPreferencesStore();
  const { addOrReplaceCurrentLocation } = useWeatherActions();

  const handleRefreshLocation = async (event?: ReactMouseEvent) => {
    event?.stopPropagation();

    if (!navigator.geolocation) {
      showToast({
        message: 'toasts.geolocationNotSupported',
        type: 'error'
      });
      return;
    }

    setIsRefreshingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Call reverse geocoding API to get city
          const response = await fetchSecure(`/api/reverse?lat=${latitude}&lon=${longitude}`, { requireAuth: true });
          if (!response.ok) {
            throw new Error('Failed to get location');
          }

          const data = await response.json();

          if (data.id) {
            updateCurrentLocation(latitude, longitude, data.id);

            // Get city name from response (API returns city: { en, he })
            const cityName = data.city?.he || data.city?.en || 'Unknown';

            // Fetch weather data for the new location
            try {
              const weatherData = await fetchWeather({
                id: data.id,
                lat: data.lat,
                lon: data.lon,
                unit: preferences.unit as TemporaryUnit,
                name: data.city,
                country: data.country,
              });

              const completeWeatherData: CityWeather = {
                ...weatherData,
                id: data.id,
                name: data.city,
                country: data.country,
                lastUpdated: Date.now(),
                // Don't set isCurrentLocation here - addOrReplaceCurrentLocation will set it
              };

              // Replace current location with new city
              await addOrReplaceCurrentLocation(completeWeatherData);

              showToast({
                message: 'toasts.locationUpdated',
                type: 'success',
                values: { city: cityName }
              });
            } catch (weatherError) {
              // If weather fetch fails, still show success but log error
              console.error('Failed to fetch weather for new location:', weatherError);
              showToast({
                message: 'toasts.locationUpdated',
                type: 'success',
                values: { city: cityName }
              });
              // Refresh page to load data from server
              router.refresh();
            }
          }
        } catch {
          showToast({
            message: 'toasts.locationUpdateFailed',
            type: 'error'
          });
        } finally {
          setIsRefreshingLocation(false);
        }
      },
      () => {
        showToast({
          message: 'toasts.locationAccessDenied',
          type: 'error'
        });
        setIsRefreshingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return {
    isRefreshingLocation,
    handleRefreshLocation
  };
}

