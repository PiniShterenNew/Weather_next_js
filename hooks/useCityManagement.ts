import type { MouseEvent as ReactMouseEvent } from "react";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

import { useCityRefresh } from "@/features/weather/hooks/useCityRefresh";
import { useWeatherActions } from "@/features/weather/hooks/useWeatherActions";
import { useToastStore } from "@/features/ui/store/useToastStore";
import { useLocationRefresh } from "@/features/location/hooks/useLocationRefresh";
import { shouldAutoRefresh } from "@/lib/weatherRefresh";
import { AppLocale } from "@/types/i18n";
import { CityWeather } from "@/types/weather";

export function useCityManagement(cityWeather: CityWeather, locale: AppLocale) {
  const t = useTranslations();
  const { removeCity, addCity } = useWeatherActions();
  const showToast = useToastStore((state) => state.showToast);
  const { refreshCityIfNeeded, isRefreshing } = useCityRefresh();
  const { isRefreshingLocation, handleRefreshLocation } = useLocationRefresh();

  useEffect(() => {
    if (cityWeather && shouldAutoRefresh(cityWeather)) {
      refreshCityIfNeeded(cityWeather, { force: false });
    }
  }, [cityWeather, refreshCityIfNeeded]);

  const handleRefresh = () => {
    refreshCityIfNeeded(cityWeather, { force: true });
  };

  const handleRemove = async () => {
    const cityName = cityWeather.name[locale] || cityWeather.name.en;
    const cityToDelete = { ...cityWeather };
    
    // Delete immediately
    await removeCity(cityWeather.id);
    
    // Show toast with undo option
    showToast({
      message: 'toasts.cityDeleted',
      type: 'success',
      values: { city: cityName },
      duration: 5000,
      action: {
        label: t('common.undo'),
        onClick: async () => {
          // Restore the city
          await addCity(cityToDelete);
          showToast({
            message: 'toasts.cityRestored',
            type: 'info',
            values: { city: cityName },
            duration: 3000
          });
        }
      }
    });
  };

  // Handle location refresh for current location - uses shared hook
  const handleRefreshLocationWrapper = async (event?: ReactMouseEvent) => {
    await handleRefreshLocation(event);
  };

  return {
    isRefreshing,
    handleRefresh,
    handleRemove,
    handleRefreshLocation: handleRefreshLocationWrapper,
    isRefreshingLocation,
  };
}
