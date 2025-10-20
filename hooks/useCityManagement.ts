import { useWeatherStore } from "@/store/useWeatherStore";
import { AppLocale } from "@/types/i18n";
import { CityWeather } from "@/types/weather";
import { shouldAutoRefresh } from "@/lib/weatherRefresh";
import { useCityRefresh } from "@/components/WeatherCard/CityInfoHelpers";
import { useEffect } from "react";

export function useCityManagement(cityWeather: CityWeather, locale: AppLocale) {
  const removeCity = useWeatherStore((s) => s.removeCity);
  const showToast = useWeatherStore((s) => s.showToast);
  const { refreshCityIfNeeded, isRefreshing } = useCityRefresh();

  useEffect(() => {
    if (cityWeather && shouldAutoRefresh(cityWeather)) {
      refreshCityIfNeeded(cityWeather, { force: false });
    }
  }, [cityWeather, refreshCityIfNeeded]);

  const handleRefresh = () => {
    refreshCityIfNeeded(cityWeather, { force: true });
  };

  const handleRemove = () => {
    removeCity(cityWeather.id);
    showToast({ 
      message: 'toasts.removed', 
      type: 'success', 
      values: { city: cityWeather.name[locale] } 
    });
  };

  return {
    isRefreshing,
    handleRefresh,
    handleRemove,
  };
}
