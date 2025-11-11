import type { MouseEvent as ReactMouseEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useCityRefresh } from "@/features/weather/hooks/useCityRefresh";
import { useWeatherActions } from "@/features/weather/hooks/useWeatherActions";
import { useWeatherDataStore } from "@/features/weather/store/useWeatherDataStore";
import { useToastStore } from "@/features/ui/store/useToastStore";
import { useLocationStore } from "@/features/location/store/useLocationStore";
import { fetchSecure } from "@/lib/fetchSecure";
import { shouldAutoRefresh } from "@/lib/weatherRefresh";
import { AppLocale } from "@/types/i18n";
import { CityWeather } from "@/types/weather";

export function useCityManagement(cityWeather: CityWeather, locale: AppLocale) {
  const { removeCity } = useWeatherActions();
  const showToast = useToastStore((state) => state.showToast);
  const autoLocationCityId = useWeatherDataStore((state) => state.autoLocationCityId);
  const updateCurrentLocation = useLocationStore((state) => state.updateCurrentLocation);
  const { refreshCityIfNeeded, isRefreshing } = useCityRefresh();
  const [deletedCity, setDeletedCity] = useState<CityWeather | null>(null);
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (cityWeather && shouldAutoRefresh(cityWeather)) {
      refreshCityIfNeeded(cityWeather, { force: false });
    }
  }, [cityWeather, refreshCityIfNeeded]);

  const handleRefresh = () => {
    refreshCityIfNeeded(cityWeather, { force: true });
  };

  const handleRemove = () => {
    const isCurrentLocation = cityWeather.id === autoLocationCityId;
    if (isCurrentLocation) {
      showToast({
        message: 'toasts.cannotDeleteCurrentLocation',
        type: 'warning'
      });
      return;
    }
    setDeletedCity(cityWeather);
  };

  const handleUndo = () => {
    setDeletedCity(null);
    showToast({
      message: 'toasts.cityRestored',
      type: 'info',
      values: { city: cityWeather.name[locale] || cityWeather.name.en }
    });
  };

  const handleConfirmDelete = () => {
    removeCity(cityWeather.id);
    setDeletedCity(null);
    showToast({
      message: 'toasts.cityDeleted',
      type: 'success',
      values: { city: cityWeather.name[locale] || cityWeather.name.en },
      duration: 3000
    });
  };

  // Handle location refresh for current location
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
            const cityName = data.cityHe || data.cityEn || 'Unknown';
            showToast({
              message: 'toasts.locationUpdated',
              type: 'success',
              values: { city: cityName }
            });
            
            // Refresh the page to load the new location data
            router.refresh();
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
    isRefreshing,
    handleRefresh,
    handleRemove,
    deletedCity,
    handleUndo,
    handleConfirmDelete,
    handleRefreshLocation,
    isRefreshingLocation,
  };
}
