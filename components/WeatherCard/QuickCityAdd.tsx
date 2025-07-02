'use client';

import { Button } from '@/components/ui/button';
import { useWeatherStore } from '@/stores/useWeatherStore';
import { useTranslations, useLocale } from 'next-intl';
import { AppLocale } from '@/types/i18n';
import { TemporaryUnit } from '@/types/ui';
import { fetchWeather } from '@/features/weather';
import { POPULAR_CITIES } from '@/constants/popularCities'; // אם הפכת לקבוע
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import SearchBar from '../SearchBar/SearchBar';

export function QuickCityAdd() {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const [open, setOpen] = useState(false);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="lg"
          aria-label={t('search.quickAdd')}
          title={t('search.quickAdd')}
        >
          + {t('search.quickAdd')}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-2/4 h-96 space-y-2 flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('search.addCity')}</DialogTitle>
        </DialogHeader>
        <SearchBar />
        <div className="flex flex-col gap-2 overflow-y-auto">
        {filteredCities.map((city) => (
          <Button
            key={city.id}
            size="sm"
            variant="ghost"
            className="w-full justify-between"
            onClick={() => {
              handleAdd(city);
              setOpen(false);
            }}
          >
            <span>{t(`popular.cities.${city.id}`)}</span>
            <span className="opacity-60">{city.country}</span>
          </Button>
        ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
