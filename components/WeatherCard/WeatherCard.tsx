'use client';

import { useCallback, useEffect, useState } from 'react';
import { useWeatherStore } from '@/stores/useWeatherStore';
import type { CityWeather } from '@/types/weather';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  RotateCcw,
  Trash,
  Droplets,
  Gauge,
  Eye,
  Cloud,
  Sun,
  Wind,
  Sunrise,
  Sunset,
  LocateFixed,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { fetchWeather } from '@/features/weather';
import {
  formatTemperature,
  formatWindSpeed,
  formatPressure,
  formatVisibility,
  formatTimeWithOffset,
  getWindDirection,
  isSameTimezone,
} from '../../lib/helpers';
import { WeatherIcon } from './WeatherIcon';
import WeatherTimeNow from './WeatherTimeNow';
import { fetchReverse } from '@/features/weather/fetchReverse';

type Properties = {
  city: CityWeather;
};

export default function WeatherCard({ city }: Properties) {
  const t = useTranslations();
  const locale = useWeatherStore((s) => s.locale);
  const getUserTimezoneOffset = useWeatherStore((s) => s.getUserTimezoneOffset);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshCity = useWeatherStore((s) => s.refreshCity);
  const removeCity = useWeatherStore((s) => s.removeCity);
  const updateCity = useWeatherStore((s) => s.updateCity);
  const unit = useWeatherStore((s) => s.unit);
  const showToast = useWeatherStore((s) => s.showToast);
  const autoLocationCityId = useWeatherStore((s) => s.autoLocationCityId); 

  // פונקציה לריענון הנתונים - מוגדרת עם useCallback כדי לא לגרום לרינדורים מיותרים
  const handleRefresh = useCallback(async (langChange = false) => {
    if (isRefreshing) return;

    setIsRefreshing(true);

    try {
      let reverseData;
      if (langChange) {
        reverseData = await fetchReverse(city.lat, city.lon, locale);
      }
      // קריאה ל-API
      const freshData = await fetchWeather({
        id: city.id,
        lat: city.lat,
        lon: city.lon,
        name: reverseData?.name || city.name,
        country: reverseData?.country || city.country,
        unit: unit,
        lang: locale,
      });

      // עדכון הנתונים במאגר
      updateCity(freshData);
      showToast({ message: 'toasts.refreshed' });
    } catch {
      showToast({ message: 'toasts.error' });
      updateCity(city);
      refreshCity(city.id);
    } finally {
      setIsRefreshing(false);
    }
  }, [city, unit, isRefreshing, updateCity, refreshCity, showToast, t, locale, fetchReverse]);

  // בדיקה האם צריך לרענן את הנתונים
  useEffect(() => {
    // בדיקה האם הנתונים ישנים (עברו 5 דקות) או שיחידת המידה שונתה
    const needsRefresh =
      Date.now() - city.lastUpdated > 3 * 60 * 60 * 1000 || // יותר מ-3 שעות
      city.unit !== unit
      ||
      city.lang !== locale; // יחידת מידה שונה

    // אם צריך ריענון ואנחנו לא באמצע פעולת ריענון
    if (needsRefresh && !isRefreshing) {
      handleRefresh(city.lang !== locale);
    }
  }, [city, unit, locale, isRefreshing, handleRefresh]);

  return (
    <div className="flex flex-col gap-10">
      {/* Header with city name and actions */}
      <div className="flex flex-col items-center justify-between">
        <div className="w-full flex items-start justify-between">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleRefresh()}
            title={t('refresh')}
            disabled={isRefreshing}
            aria-label="Refresh"
          >
            {isRefreshing ? (
              <Loader2 size={18} className="animate-spin" role="presentation" />
            ) : (
              <RotateCcw size={18} role="presentation" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => removeCity(city.id)}
            title={t('remove')}
            aria-label="Remove"
          >
            <Trash size={18} role="presentation" />
          </Button>
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold flex items-center flex-row gap-2">
            {city.name}{' '}
            {city.isCurrentLocation || city.id === autoLocationCityId ? <LocateFixed size={18} role="presentation" data-testid="location-icon" /> : ''}
          </h2>
          <p className="text-sm opacity-70">{city.country}</p>
          <WeatherTimeNow timezone={city.current.timezone} lastUpdated={city.lastUpdated} />
        </div>
      </div>

      {/* Current weather */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center justify-center gap-4">
          <div className="relative">
            {/* <Image
              src={`https://openweathermap.org/img/wn/${city.current.icon}@4x.png`}
              alt={city.current.desc}
              className="h-24 w-24"
              width={96}
              height={96}
              priority
            /> */}
            <WeatherIcon
              code={city.current.icon}
              alt={city.current.desc}
              size={96}
              priority
              className="shrink-0"
            />
          </div>
          <div className="text-center">
            <div className="relative text-5xl font-bold">
              {formatTemperature(city.current.temp, city.unit)}
            </div>
            <p className="text-lg capitalize">{city.current.desc}</p>
            <p className="text-sm opacity-70">
              {t('feelsLike')} {formatTemperature(city.current.feelsLike, city.unit)}
            </p>
          </div>
        </div>

        {/* Weather details grid */}
        <div className="grid grid-cols-2 gap-4 w-full mt-4">
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Droplets className="h-5 w-5 text-blue-500" role="presentation" />
            <div>
              <p className="text-sm opacity-70">{t('humidity')}</p>
              <p className="font-medium">{city.current.humidity}%</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Wind className="h-5 w-5 text-blue-400" role="presentation" />
            <div>
              <p className="text-sm opacity-70">{t('wind')}</p>
              <p className="font-medium" data-testid="wind">
                {formatWindSpeed(city.current.wind, city.unit)}{' '}
                {getWindDirection(city.current.windDeg)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Gauge className="h-5 w-5 text-purple-500" role="presentation" />
            <div>
              <p className="text-sm opacity-70">{t('pressure')}</p>
              <p className="font-medium">{formatPressure(city.current.pressure)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Eye className="h-5 w-5 text-amber-500" role="presentation" />
            <div>
              <p className="text-sm opacity-70">{t('visibility')}</p>
              <p className="font-medium">{formatVisibility(city.current.visibility)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Cloud className="h-5 w-5 text-gray-400" role="presentation" />
            <div>
              <p className="text-sm opacity-70">{t('clouds')}</p>
              <p className="font-medium">{city.current.clouds}%</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Sun className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-sm opacity-70">{t('uvIndex')}</p>
              <p className="font-medium">N/A</p>
            </div>
          </div>
        </div>

        {/* Sunrise/Sunset */}
        <div className="grid grid-cols-2 gap-4 w-full mt-2">
          {/* Sunrise */}
          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <Sunrise className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-sm opacity-70">{t('sunrise')}</p>
              <p className="font-medium flex flex-col items-start">
                <span>{formatTimeWithOffset(city.current.sunrise, city.current.timezone)}</span>
                {!isSameTimezone(city.current.timezone, getUserTimezoneOffset()) && (
                  <span className="ml-2 text-xs opacity-70">
                    ({formatTimeWithOffset(city.current.sunrise, getUserTimezoneOffset())}{' '}
                    {t('yourTime')})
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Sunset */}
          <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <Sunset className="h-5 w-5 text-indigo-500" />
            <div>
              <p className="text-sm opacity-70">{t('sunset')}</p>
              <p className="font-medium flex flex-col items-start">
                <span>{formatTimeWithOffset(city.current.sunset, city.current.timezone)}</span>
                {!isSameTimezone(city.current.timezone, getUserTimezoneOffset()) && (
                  <span className="ml-2 text-xs opacity-70">
                    ({formatTimeWithOffset(city.current.sunset, getUserTimezoneOffset())}{' '}
                    {t('yourTime')})
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
