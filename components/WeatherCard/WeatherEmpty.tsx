'use client';

import { useTranslations } from 'next-intl';
import { useWeatherStore } from '@/stores/useWeatherStore';
import { fetchWeather } from '@/features/weather';
import { Button } from '@/components/ui/button';
import { useLocale } from 'next-intl';
import { AppLocale } from '@/types/i18n';
import { LocateFixed } from 'lucide-react';
import { TemporaryUnit } from '@/types/ui';
import { fetchReverse } from '@/features/weather/fetchReverse';
import { POPULAR_CITIES } from '@/constants/popularCities';

export default function WeatherEmpty() {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const unit = useWeatherStore((s) => s.unit);
  const addCity = useWeatherStore((s) => s.addCity);
  const showToast = useWeatherStore((s) => s.showToast);
  const cities = useWeatherStore((s) => s.cities);
  const setIsLoading = useWeatherStore((s) => s.setIsLoading);
  const addOrReplaceCurrentLocation = useWeatherStore((s) => s.addOrReplaceCurrentLocation);
  const autoLocationCityId = useWeatherStore((s) => s.autoLocationCityId);

  // פונקציה להוספת עיר פופולרית
  const handleAddCity = async (city: typeof POPULAR_CITIES[number]) => {
    setIsLoading(true); // התחלת טעינה
    try {
      const cityName = t(`popular.cities.${city.id}`);

      // בדיקה אם העיר כבר קיימת
      const cityExists = cities.some(c =>
        (c.lat === city.lat && c.lon === city.lon)
      );

      if (cityExists) {
        showToast({ message: 'toasts.exists' });
        return;
      }

      const weatherData = await fetchWeather({
        ...city,
        name: cityName, // שימוש בשם המתורגם
        unit: unit as TemporaryUnit,
        lang: locale,
      });

      addCity(weatherData);
      showToast({ message: 'toasts.added', values: { name: cityName } });
    } catch {
      showToast({ message: 'toasts.error' });
    } finally {
      setIsLoading(false); // סיום טעינה
    }
  };

  // פונקציה להוספת מיקום נוכחי
  const handleAddCurrentLocation = async () => {
    if (typeof window === 'undefined') return;
    
    if (!navigator.geolocation || typeof navigator.geolocation.getCurrentPosition !== 'function') {
      showToast({ message: 'errors.geolocationNotSupported' });
      return;
    }
    try {
      setIsLoading(true); // התחלת טעינה

      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          try {
            const cityInfo = await fetchReverse(coords.latitude, coords.longitude, locale);
            const weatherData = await fetchWeather({
              lat: coords.latitude,
              lon: coords.longitude,
              name: cityInfo.name,
              country: cityInfo.country,
              unit: unit as TemporaryUnit,
              lang: locale,
              id: '',
            });

            // ניצור ID ייחודי למיקום הנוכחי
            const currentLocationId = `current_${coords.latitude.toFixed(2)}_${coords.longitude.toFixed(2)}`;

            // נוסיף את ה-ID לנתוני מזג האוויר
            addOrReplaceCurrentLocation({
              ...weatherData,
              id: currentLocationId,
              isCurrentLocation: true
            });

            showToast( { message: 'toasts.locationAdded', values: { name: weatherData.name } });
          } catch {
            showToast({ message: 'errors.fetchLocationWeather' });
          }
        },
        () => {
          showToast({ message: 'errors.geolocationDenied' });
        },
        { enableHighAccuracy: false, timeout: 10_000 },
      );
    } finally {
      setIsLoading(false); // סיום טעינה
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 max-w-md mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">{t('empty')}</h1>
        <p className="text-gray-500">{t('emptyDescription')}</p>
      </div>

      {/* כפתור מיקום נוכחי - מוצג רק בדפדפן */}
      {typeof window !== 'undefined' && !autoLocationCityId && (
        <div className="mt-2">
          <Button
            onClick={handleAddCurrentLocation}
            className="flex items-center gap-2"
            variant="outline"
            data-testid="add-current-location-button"
          >
            <LocateFixed className="h-4 w-4" />
            {t('search.addCurrentLocation')}
          </Button>
        </div>
      )}

      {/* רשימת ערים פופולריות */}
      <div className="w-full mt-4">
        <h2 className="text-lg font-semibold mb-3 text-center">
          {t('popular.title')}
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {POPULAR_CITIES.map((city) => (
            <Button
              key={`${city.id}-${city.country}`}
              variant="outline"
              size="sm"
              className="text-sm justify-start overflow-hidden text-ellipsis whitespace-nowrap"
              onClick={() => handleAddCity(city)}
            >
              <span>{t(`popular.cities.${city.id}`)}</span>
              <span className="ms-1 opacity-70">{city.country}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}