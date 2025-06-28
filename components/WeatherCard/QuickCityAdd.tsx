'use client';

import { Button } from '@/components/ui/button';
import { useWeatherStore } from '@/stores/useWeatherStore';
import { useTranslations, useLocale } from 'next-intl';
import { AppLocale } from '@/types/i18n';
import { TemporaryUnit } from '@/types/ui';
import { fetchWeather } from '@/features/weather';
import { POPULAR_CITIES } from '@/constants/popularCities'; // אם הפכת לקבוע
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

export function QuickCityAdd() {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const cities = useWeatherStore((s) => s.cities);
  const addCity = useWeatherStore((s) => s.addCity);
  const showToast = useWeatherStore((s) => s.showToast);
  const setIsLoading = useWeatherStore((s) => s.setIsLoading);
  const unit = useWeatherStore((s) => s.unit);

  const existing = new Set(cities.map((c) => `${c.lat.toFixed(2)},${c.lon.toFixed(2)}`));
  const filteredCities = POPULAR_CITIES.filter(
    (c) => !existing.has(`${c.lat.toFixed(2)},${c.lon.toFixed(2)}`)
  );

  const handleAdd = async (city: typeof POPULAR_CITIES[number]) => {
    setIsLoading(true);
    try {
      const name = t(`popular.cities.${city.id}`);
      const data = await fetchWeather({ ...city, name, unit: unit as TemporaryUnit, lang: locale });
      addCity(data);
      showToast({ message: 'toasts.added', values: { name } });
    } catch {
      showToast({ message: 'toasts.error' });
    } finally {
      setIsLoading(false);
    }
  };

  if (filteredCities.length === 0) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          + {t('search.quickAdd')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 space-y-2">
        {filteredCities.map((city) => (
          <Button
            key={city.id}
            size="sm"
            variant="ghost"
            className="w-full justify-between"
            onClick={() => handleAdd(city)}
          >
            <span>{t(`popular.cities.${city.id}`)}</span>
            <span className="opacity-60">{city.country}</span>
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
