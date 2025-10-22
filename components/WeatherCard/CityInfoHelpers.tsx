import { CityWeather } from "@/types/weather";
import { useCallback, useState } from "react";
import { useWeatherStore } from "@/store/useWeatherStore";
import { isCityDataStale } from "@/lib/weatherRefresh";
import { fetchWeather } from "@/features/weather";

export function useCityRefresh() {
  const showToast = useWeatherStore((s) => s.showToast);
  const updateCity = useWeatherStore((s) => s.updateCity);
  const refreshCity = useWeatherStore((s) => s.refreshCity);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshCityIfNeeded = useCallback(async (city: CityWeather, options: { force?: boolean } = {}) => {
    const { force = false } = options;
    const isStale = isCityDataStale(city);
    if (!isStale && !force) {
      return;
    }

    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      const freshData = await fetchWeather({
        id: city.id,
        lat: city.lat,
        lon: city.lon,
        unit: city.unit,
      });

      updateCity({ ...freshData, lastUpdated: Date.now() });
    } catch {
      showToast({ message: 'toasts.error', type: 'error' });
      updateCity(city);
      refreshCity(city.id);
    } finally {
      setIsRefreshing(false);
    }
  }, [showToast, updateCity, refreshCity, isRefreshing]);

  return { refreshCityIfNeeded, isRefreshing };
}
