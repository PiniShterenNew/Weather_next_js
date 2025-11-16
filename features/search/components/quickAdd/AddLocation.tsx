'use client';

import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';

import { Button, type ButtonProperties } from '@/components/ui/button';
import { WeatherIcon } from '@/features/weather/components/WeatherIcon';
import { getDirection } from '@/lib/intl';
import { useAppPreferencesStore } from '@/store/useAppPreferencesStore';
import { useWeatherActions } from '@/features/weather/hooks/useWeatherActions';
import { useWeatherDataStore } from '@/features/weather/store/useWeatherDataStore';
import { useToastStore } from '@/features/ui/store/useToastStore';
import announceAction from '@/lib/actions/announceAction';
import type { AppLocale } from '@/types/i18n';
import type { TemporaryUnit } from '@/types/ui';
import { fetchReverse } from '@/features/weather/fetchReverse';
import { fetchWeather } from '@/features/weather';
import { useBusyStore } from '@/store/useBusyStore';

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
  const { addOrReplaceCurrentLocation, closeQuickAddAndResetLoading } = useWeatherActions();
  const cities = useWeatherDataStore((state) => state.cities);
  const { showToast } = useToastStore();
  const locale = useLocale() as AppLocale;
  const direction = getDirection(locale);

  const handleAddCurrentLocation = async () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      showToast({ message: 'toasts.geolocationDenied', type: 'error' });
      return;
    }

    const busy = useBusyStore.getState();
    const token = busy.beginBusy('add', 'location', {
      blocking: true,
      status: { key: 'search.loading' },
    });

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
        name: cityInfo.city || weatherData.name,
        country: cityInfo.country || weatherData.country,
        lastUpdated: Date.now(),
        isCurrentLocation: true,
      };

      await addOrReplaceCurrentLocation(completeWeatherData);

      await announceAction({
        run: async () => {},
        successMessageKey: 'toasts.locationAdded',
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
            await announceAction({ run: async () => {}, errorMessageKey: 'toasts.geolocationDenied' });
            break;
          case error.TIMEOUT:
            await announceAction({ run: async () => {}, errorMessageKey: 'toasts.geolocationTimeout' });
            break;
          default:
            await announceAction({ run: async () => {}, errorMessageKey: 'toasts.apiFailure' });
        }
      } else {
        await announceAction({ run: async () => {}, errorMessageKey: 'toasts.apiFailure' });
      }
    } finally {
      busy.endBusy(token);
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


