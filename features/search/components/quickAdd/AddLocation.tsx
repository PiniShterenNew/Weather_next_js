'use client';

import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';

import { Button, type ButtonProperties } from '@/components/ui/button';
import { WeatherIcon } from '@/components/WeatherIcon/WeatherIcon';
import { getDirection } from '@/lib/intl';
import { useAppPreferencesStore } from '@/store/useAppPreferencesStore';
import { useWeatherActions } from '@/features/weather/hooks/useWeatherActions';
import { useWeatherDataStore } from '@/features/weather/store/useWeatherDataStore';
import { useToastStore } from '@/features/ui/store/useToastStore';
import type { AppLocale } from '@/types/i18n';
import type { TemporaryUnit } from '@/types/ui';
import { fetchReverse } from '@/features/weather/fetchReverse';
import { fetchWeather } from '@/features/weather';

interface AddLocationProps {
  size?: ButtonProperties['size'];
  type?: 'icon' | 'default';
  dataTestId?: string;
  onComplete?: () => void;
}

const getCurrentPositionAsync = (): Promise<GeolocationPosition> =>
  new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      maximumAge: 60_000,
      timeout: 5_000,
    });
  });

const AddLocation = ({ size = 'md', type = 'default', dataTestId, onComplete }: AddLocationProps) => {
  const t = useTranslations();
  const preferences = useAppPreferencesStore();
  const { addOrReplaceCurrentLocation, setIsLoading, closeQuickAddAndResetLoading } = useWeatherActions();
  const cities = useWeatherDataStore((state) => state.cities);
  const { showToast } = useToastStore();
  const locale = useLocale() as AppLocale;
  const direction = getDirection(locale);

  const handleAddCurrentLocation = async () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      showToast({ message: 'toasts.geolocationDenied', type: 'error' });
      return;
    }

    setIsLoading(true);

    try {
      const { coords } = await getCurrentPositionAsync();
      const cityInfo = await fetchReverse(coords.latitude, coords.longitude, preferences.locale);
      const weatherData = await fetchWeather({
        lat: cityInfo.lat,
        lon: cityInfo.lon,
        unit: preferences.unit as TemporaryUnit,
        id: cityInfo.id,
      });

      const completeWeatherData = {
        ...weatherData,
        id: cityInfo.id,
        lastUpdated: Date.now(),
        isCurrentLocation: true,
      };

      await addOrReplaceCurrentLocation(completeWeatherData);

      showToast({
        message: 'toasts.locationAdded',
        type: 'success',
        values: { name: completeWeatherData.name[preferences.locale] },
      });

      if (onComplete) {
        onComplete();
      }
      closeQuickAddAndResetLoading();
    } catch (error) {
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            showToast({ message: 'toasts.geolocationDenied', type: 'error' });
            break;
          case error.TIMEOUT:
            showToast({ message: 'toasts.geolocationTimeout', type: 'error' });
            break;
          default:
            showToast({ message: 'toasts.apiFailure', type: 'error' });
        }
      } else {
        showToast({ message: 'toasts.apiFailure', type: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleAddCurrentLocation}
      title={t('search.currentLocation')}
      data-testid={dataTestId}
      aria-label={t('search.currentLocation')}
      disabled={cities.some((city) => city.isCurrentLocation)}
      className="rounded-full shadow-sm transition-colors hover:bg-primary/10"
      dir={direction}
      asChild
    >
      <motion.button whileHover="hover">
        <motion.span
          variants={{ hover: { scale: 1.2 } }}
          transition={{ duration: 0.2 }}
          data-testid="location-icon"
          role="presentation"
          className="inline-flex"
        >
          <WeatherIcon icon="location" size={24} />
        </motion.span>
        {type !== 'icon' ? t('search.addCurrentLocation') : null}
      </motion.button>
    </Button>
  );
};

export default AddLocation;


