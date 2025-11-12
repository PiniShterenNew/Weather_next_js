'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useWeatherStore } from '@/store/useWeatherStore';
// import { useShallow } from 'zustand/react/shallow'; // unused
import { AppLocale } from '@/types/i18n';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AnimatePresence } from 'framer-motion';
import { Navigation } from 'lucide-react';
import { getDirection } from '@/lib/intl';

export default function LocationChangeDialog() {
  const t = useTranslations('location');
  const locale = useLocale() as AppLocale;
  const isOpen = useWeatherStore((s) => s.locationChangeDialog.isOpen);
  const oldCity = useWeatherStore((s) => s.locationChangeDialog.oldCity);
  const newCity = useWeatherStore((s) => s.locationChangeDialog.newCity);
  const distance = useWeatherStore((s) => s.locationChangeDialog.distance);
  const hideLocationChangeDialog = useWeatherStore((s) => s.hideLocationChangeDialog);
  const handleLocationChange = useWeatherStore((s) => s.handleLocationChange);
  const cities = useWeatherStore((s) => s.cities);
  const isRTL = getDirection(locale) === 'rtl';

  const onKeepOldCity = () => {
    if (oldCity && newCity && distance !== undefined) {
      const oldCityData = cities.find(c => c.name.en === oldCity.name.en && c.country.en === oldCity.country.en);
      if (oldCityData) {
        handleLocationChange(true, oldCityData.id, {
          ...newCity,
          id: newCity.name.en + newCity.country.en, // Temporary ID, will be replaced by actual city ID from API
          lat: 0, // Placeholder
          lon: 0, // Placeholder
          lastUpdated: Date.now(),
          isCurrentLocation: true,
          // timezone: 0, // Placeholder - removed as it's not in CityWeather type
          current: {
            codeId: 800,
            temp: 20,
            feelsLike: 20,
            tempMin: 15,
            tempMax: 25,
            desc: 'Clear',
            icon: '01d',
            humidity: 50,
            wind: 5,
            windDeg: 0,
            pressure: 1013,
            visibility: 10000,
            clouds: 0,
            sunrise: 0,
            sunset: 0,
            timezone: '',
            uvIndex: null,
            rainProbability: null
          },
          // daily: [] as any, // Placeholder - removed as it's not in CityWeather type
          hourly: [], // Placeholder
          forecast: [], // Added missing forecast
          unit: 'metric' // Added missing unit
        });
      }
    }
    hideLocationChangeDialog();
  };

  const onRemoveOldCity = () => {
    if (oldCity && newCity && distance !== undefined) {
      const oldCityData = cities.find(c => c.name.en === oldCity.name.en && c.country.en === oldCity.country.en);
      if (oldCityData) {
        handleLocationChange(false, oldCityData.id, {
          ...newCity,
          id: newCity.name.en + newCity.country.en, // Temporary ID, will be replaced by actual city ID from API
          lat: 0, // Placeholder
          lon: 0, // Placeholder
          lastUpdated: Date.now(),
          isCurrentLocation: true,
          // timezone: 0, // Placeholder - removed as it's not in CityWeather type
          current: {
            codeId: 800,
            temp: 20,
            feelsLike: 20,
            tempMin: 15,
            tempMax: 25,
            desc: 'Clear',
            icon: '01d',
            humidity: 50,
            wind: 5,
            windDeg: 0,
            pressure: 1013,
            visibility: 10000,
            clouds: 0,
            sunrise: 0,
            sunset: 0,
            timezone: '',
            uvIndex: null,
            rainProbability: null
          },
          // daily: [] as any, // Placeholder - removed as it's not in CityWeather type
          hourly: [], // Placeholder
          forecast: [], // Added missing forecast
          unit: 'metric' // Added missing unit
        });
      }
    }
    hideLocationChangeDialog();
  };

  if (!isOpen || !oldCity || !newCity || distance === undefined) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={hideLocationChangeDialog}>
          <DialogContent 
            className="w-full max-w-none mx-4 sm:mx-6"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                <Navigation className="h-5 w-5 text-blue-600" />
                {t('locationChanged')}
              </DialogTitle>
              <DialogDescription>
                {t('locationChangedMessage', {
                  oldCity: oldCity.name[locale],
                  newCity: newCity.name[locale],
                })}
                {distance && (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {t('distance')}: {distance.toFixed(2)} {t('kilometers')}
                  </p>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={onRemoveOldCity}
                className="w-full sm:w-auto"
              >
                {t('removeOldCity')}
              </Button>
              <Button
                onClick={onKeepOldCity}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              >
                {t('keepOldCity')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}