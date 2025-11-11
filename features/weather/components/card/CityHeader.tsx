'use client';

import { Loader2, MapPin, Navigation, RotateCcw, Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { WeatherIcon } from '@/components/WeatherIcon/WeatherIcon';
import WeatherTimeNow from '@/features/weather/components/WeatherTimeNow';
import { formatTemperatureWithConversion, isSameTimezone } from '@/lib/helpers';
import { useWeatherStore } from '@/store/useWeatherStore';
import type { AppLocale } from '@/types/i18n';
import type { CityWeather, CityWeatherCurrent } from '@/types/weather';

interface CityHeaderProps {
  cityWeather: CityWeather;
  cityLocale: CityWeatherCurrent;
  locale: AppLocale;
  isRefreshing: boolean;
  onRefresh: () => void;
  onRemove: () => void;
  onRefreshLocation?: () => void;
  isRefreshingLocation?: boolean;
}

const CityHeader = ({
  cityWeather,
  cityLocale,
  locale,
  isRefreshing,
  onRefresh,
  onRemove,
  onRefreshLocation,
  isRefreshingLocation = false,
}: CityHeaderProps) => {
  const t = useTranslations();
  const getUserTimezoneOffset = useWeatherStore((state) => state.getUserTimezoneOffset);
  const currentUnit = useWeatherStore((state) => state.unit);
  const autoLocationCityId = useWeatherStore((state) => state.autoLocationCityId);
  const isCurrentLocation = cityWeather.id === autoLocationCityId;

  return (
    <div className="px-2 pt-2">
      <div className="min-h-[50px]" data-drag-handle>
        <div className="mb-4 flex items-center justify-between">
          <h1 id="city-name" className="animate-slide-up flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
            {isCurrentLocation && (
              <div title={t('cities.currentLocation')} aria-label={t('cities.currentLocation')}>
                <MapPin className="h-5 w-5 flex-shrink-0 animate-pulse text-sky-500 dark:text-sky-400" aria-hidden="true" />
              </div>
            )}
            <span>{cityWeather.name[locale] || cityWeather.name.en}</span>
          </h1>
          <div className="flex gap-2">
            {isCurrentLocation && onRefreshLocation ? (
              <Button
                size="icon"
                variant="ghost"
                onClick={onRefreshLocation}
                title={t('cities.refreshLocation')}
                disabled={isRefreshingLocation}
                aria-label={t('cities.refreshLocation')}
                className={`h-8 w-8 transition-all hover:bg-blue-100 hover-scale text-gray-900 dark:text-white dark:hover:bg-blue-900/20 ${
                  isRefreshingLocation ? 'animate-pulse' : ''
                }`}
              >
                {isRefreshingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" aria-hidden="true" />
                ) : (
                  <Navigation className="h-4 w-4 text-blue-500 dark:text-blue-400" aria-hidden="true" />
                )}
              </Button>
            ) : null}

            <Button
              size="icon"
              variant="ghost"
              onClick={onRefresh}
              title={t('refresh')}
              disabled={isRefreshing}
              aria-label={`${t('refresh')} ${cityWeather.name[locale] || cityWeather.name.en}`}
              aria-busy={isRefreshing}
              className={`h-8 w-8 transition-all hover:bg-gray-100 hover-scale text-gray-900 dark:text-white dark:hover:bg-white/10 ${
                isRefreshing ? 'refresh-rotate animate-pulse ring-2 ring-brand-400/50' : ''
              }`}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin-180 text-brand-500" aria-hidden="true" />
              ) : (
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={onRemove}
              title={t('remove')}
              aria-label={`${t('remove')} ${cityWeather.name[locale] || cityWeather.name.en}`}
              className="h-8 w-8 hover-scale text-gray-900 transition-all hover:bg-gray-100 dark:text-white dark:hover:bg-white/10"
            >
              <Trash className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 py-2 lg:hidden" data-drag-handle>
        <div className="flex items-center gap-3 animate-fade-in">
          <WeatherIcon code={String(cityLocale.current.codeId)} icon={cityLocale.current.icon} size={50} className="text-5xl text-brand-400" />
          <p className="text-sm font-medium text-gray-600 dark:text-white/70">{cityWeather.country[locale]}</p>
        </div>

        <div className="text-center animate-scale-in">
          <p className="text-6xl font-light tracking-tight text-gray-900 tabular-nums leading-tight dark:text-white">
            {formatTemperatureWithConversion(cityLocale.current.temp, cityLocale.unit, currentUnit)}
          </p>
          <p className="mt-2 text-base font-medium capitalize text-gray-700 dark:text-white/80">{cityLocale.current.desc}</p>
          <div className="mt-3 text-center">
            <p className="text-sm text-gray-600 dark:text-white/60">
              {t('feelsLike')} {formatTemperatureWithConversion(cityLocale.current.feelsLike, cityLocale.unit, currentUnit)}
            </p>
          </div>
        </div>

        <WeatherTimeNow
          timezone={cityLocale.current.timezone}
          userTimezoneOffset={getUserTimezoneOffset()}
          isSameTimezone={isSameTimezone(cityLocale.current.timezone, getUserTimezoneOffset())}
        />

        {cityLocale.current.tempMin !== undefined && cityLocale.current.tempMax !== undefined ? (
          <div className="flex items-center gap-4 text-sm tabular-nums animate-fade-in">
            <div className="hover-scale flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-50 px-4 py-3 transition-all dark:bg-black/40">
              <span className="text-lg font-bold text-red-500 dark:text-red-400" aria-label={t('high')}>
                ↑
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {formatTemperatureWithConversion(cityLocale.current.tempMax, cityLocale.unit, currentUnit)}
              </span>
            </div>
            <div className="hover-scale flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-50 px-4 py-3 transition-all dark:bg-black/40">
              <span className="text-lg font-bold text-blue-500 dark:text-blue-400" aria-label={t('low')}>
                ↓
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {formatTemperatureWithConversion(cityLocale.current.tempMin, cityLocale.unit, currentUnit)}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="hidden items-center justify-between gap-8 py-4 lg:flex" data-drag-handle>
        <div className="flex items-center gap-6 animate-fade-in">
          <WeatherIcon code={String(cityLocale.current.codeId)} icon={cityLocale.current.icon} size={80} className="text-7xl text-brand-400" />
          <div className="flex flex-col gap-2">
            <p className="text-xl font-medium capitalize text-gray-700 dark:text-white/80">{cityLocale.current.desc}</p>
            <p className="text-base font-medium text-gray-600 dark:text-white/70">{cityWeather.country[locale]}</p>
            <WeatherTimeNow
              timezone={cityLocale.current.timezone}
              userTimezoneOffset={getUserTimezoneOffset()}
              isSameTimezone={isSameTimezone(cityLocale.current.timezone, getUserTimezoneOffset())}
            />
          </div>
        </div>

        <div className="animate-scale-in text-center">
          <p className="text-8xl font-light tracking-tight text-gray-900 tabular-nums leading-tight dark:text-white">
            {formatTemperatureWithConversion(cityLocale.current.temp, cityLocale.unit, currentUnit)}
          </p>
          <div className="mt-2 text-center">
            <p className="text-lg text-gray-600 dark:text-white/60">
              {t('feelsLike')} {formatTemperatureWithConversion(cityLocale.current.feelsLike, cityLocale.unit, currentUnit)}
            </p>
          </div>
          {cityLocale.current.tempMin !== undefined && cityLocale.current.tempMax !== undefined ? (
            <div className="hover-scale mt-4 flex items-center justify-center gap-4 text-sm tabular-nums animate-fade-in">
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-50 px-4 py-3 transition-all dark:bg-black/40">
                <span className="text-lg font-bold text-red-500 dark:text-red-400" aria-label={t('high')}>
                  ↑
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatTemperatureWithConversion(cityLocale.current.tempMax, cityLocale.unit, currentUnit)}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-50 px-4 py-3 transition-all dark:bg-black/40">
                <span className="text-lg font-bold text-blue-500 dark:text-blue-400" aria-label={t('low')}>
                  ↓
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatTemperatureWithConversion(cityLocale.current.tempMin, cityLocale.unit, currentUnit)}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CityHeader;


