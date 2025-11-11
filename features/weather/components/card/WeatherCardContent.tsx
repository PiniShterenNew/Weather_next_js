'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Loader2, MapPin, Navigation, RotateCcw, Sunrise, Sunset, Trash, Trash2 } from 'lucide-react';

import ForecastListSkeleton from '@/components/skeleton/ForecastListSkeleton';
import { Button } from '@/components/ui/button';
import { WeatherIcon } from '@/components/WeatherIcon/WeatherIcon';
import WeatherDetails from '@/features/weather/components/WeatherDetails';
import WeatherTimeNow from '@/features/weather/components/WeatherTimeNow';
import { useCityManagement } from '@/hooks/useCityManagement';
import { useWeatherStore } from '@/store/useWeatherStore';
import type { AppLocale } from '@/types/i18n';
import type { CityWeather, CityWeatherCurrent } from '@/types/weather';
import type { TemporaryUnit } from '@/types/ui';
import { formatTemperatureWithConversion, formatTimeWithTimezone, isSameTimezone } from '@/lib/helpers';

import CityHeader from './CityHeader';

const ForecastList = dynamic(() => import('@/features/weather/components/ForecastList'), {
  ssr: false,
  loading: () => <ForecastListSkeleton />,
});

const HourlyForecast = dynamic(() => import('@/features/weather/components/HourlyForecast'), {
  ssr: false,
  loading: () => <div className="h-32 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />,
});

interface WeatherCardContentProps {
  cityWeather: CityWeather;
  locale: AppLocale;
  cityLocale: CityWeatherCurrent;
}

const WeatherCardContent = ({ cityWeather, locale, cityLocale }: WeatherCardContentProps) => {
  const t = useTranslations();
  const {
    isRefreshing,
    handleRefresh,
    handleRemove,
    deletedCity,
    handleUndo,
    handleConfirmDelete,
    handleRefreshLocation,
    isRefreshingLocation,
  } = useCityManagement(cityWeather, locale);
  const unit = useWeatherStore((state) => state.unit);
  const autoLocationCityId = useWeatherStore((state) => state.autoLocationCityId);
  const getUserTimezoneOffset = useWeatherStore((state) => state.getUserTimezoneOffset);
  const cityName = cityWeather.name[locale] || cityWeather.name.en;
  const isCurrentLocation = cityWeather.id === autoLocationCityId;

  if (deletedCity) {
    return (
      <div className="scrollbar-hide h-full overflow-y-auto overflow-x-hidden scroll-smooth" role="article" aria-labelledby="city-name">
        <motion.div initial={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }} className="p-4">
          <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <div className="flex items-center gap-3">
              <Trash2 className="h-5 w-5 text-red-500" />
              <span className="font-medium text-red-700 dark:text-red-300">{t('cities.cityDeleted', { city: cityName })}</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleUndo} className="text-xs">
                <RotateCcw className="mr-1 h-3 w-3" />
                {t('common.undo')}
              </Button>
              <Button size="sm" variant="destructive" onClick={handleConfirmDelete} className="text-xs">
                {t('common.confirm')}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className={`scrollbar-hide h-full overflow-y-auto overflow-x-hidden scroll-smooth transition-all duration-300 ${
        isRefreshing ? 'opacity-60' : 'opacity-100'
      }`}
      role="article"
      aria-labelledby="city-name"
      style={{ touchAction: 'pan-y' }}
    >
      <div className="flex flex-col gap-4 pb-24 pl-4 pr-4 pt-4 md:pl-6 md:pr-6 md:pt-6 xl:pl-8 xl:pr-8 xl:pt-8 lg:hidden">
        <div className="flex-shrink-0" data-drag-handle>
          <CityHeader
            cityWeather={cityWeather}
            cityLocale={cityLocale}
            locale={locale}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
            onRemove={handleRemove}
            onRefreshLocation={handleRefreshLocation}
            isRefreshingLocation={isRefreshingLocation}
          />
        </div>

        <WeatherDetails cityLocale={cityLocale} _locale={locale} />

        <div className="flex flex-col gap-4">
          {cityWeather.hourly && cityWeather.hourly.length > 0 ? (
            <HourlyForecast hourly={cityWeather.hourly} cityUnit={cityWeather.unit as TemporaryUnit} unit={unit as TemporaryUnit} />
          ) : null}

          <ForecastList cityUnit={cityWeather.unit as TemporaryUnit} forecast={cityWeather.forecast} unit={unit as TemporaryUnit} />

          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-white/50" aria-live="polite">
              {t('lastUpdated')} <span dir="ltr">{formatTimeWithTimezone(cityWeather.lastUpdated / 1000, cityLocale.current.timezone)}</span>
            </p>
          </div>
        </div>
      </div>

      <section className="hidden pb-24 pl-8 pr-8 pt-8 lg:block">
        <div className="grid grid-cols-[1fr_1fr] items-start gap-8">
          <div className="flex flex-col gap-5">
            <div className="animate-scale-in text-center">
              <p className="text-8xl font-light leading-tight tracking-tight text-gray-900 tabular-nums dark:text-white">
                {formatTemperatureWithConversion(cityLocale.current.temp, cityLocale.unit as TemporaryUnit, unit as TemporaryUnit)}
              </p>
              <p className="mt-4 text-xl font-medium capitalize text-gray-700 dark:text-white/80">{cityLocale.current.desc}</p>
              <div className="mt-4 text-center">
                <p className="text-lg text-gray-600 dark:text-white/60">
                  {t('feelsLike')} {cityLocale.current.feelsLike !== null ? formatTemperatureWithConversion(cityLocale.current.feelsLike, cityLocale.unit as TemporaryUnit, unit as TemporaryUnit) : '--'}
                </p>
              </div>
              {cityLocale.current.tempMin !== undefined && cityLocale.current.tempMax !== undefined ? (
                <div className="animate-fade-in mt-4 flex items-center justify-center gap-4 text-sm tabular-nums">
                  <div className="hover-scale flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-50 px-4 py-3 transition-all dark:bg-black/40">
                    <span className="text-lg font-bold text-red-500 dark:text-red-400" aria-label={t('high')}>
                      ↑
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatTemperatureWithConversion(cityLocale.current.tempMax, cityLocale.unit as TemporaryUnit, unit as TemporaryUnit)}
                    </span>
                  </div>
                  <div className="hover-scale flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-50 px-4 py-3 transition-all dark:bg-black/40">
                    <span className="text-lg font-bold text-blue-500 dark:text-blue-400" aria-label={t('low')}>
                      ↓
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatTemperatureWithConversion(cityLocale.current.tempMin, cityLocale.unit as TemporaryUnit, unit as TemporaryUnit)}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            <WeatherDetails cityLocale={cityLocale} _locale={locale} />
          </div>

          <div className="flex flex-col gap-5" data-drag-handle>
            <div className="flex items-center justify-between">
              <h1 id="city-name" className="animate-slide-up flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                {isCurrentLocation ? (
                  <div title={t('cities.currentLocation')} aria-label={t('cities.currentLocation')}>
                    <MapPin className="h-5 w-5 flex-shrink-0 animate-pulse text-sky-500 dark:text-sky-400" aria-hidden="true" />
                  </div>
                ) : null}
                <span>{cityWeather.name[locale] || cityWeather.name.en}</span>
              </h1>
              <div className="flex gap-2">
                {isCurrentLocation && handleRefreshLocation ? (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleRefreshLocation}
                    title={t('cities.refreshLocation')}
                    disabled={isRefreshingLocation}
                    className={`h-8 w-8 text-gray-900 transition-all hover:bg-blue-100 hover-scale dark:text-white dark:hover:bg-blue-900/20 ${
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
                  onClick={handleRefresh}
                  title={t('refresh')}
                  disabled={isRefreshing}
                  className={`h-8 w-8 text-gray-900 transition-all hover:bg-gray-100 hover-scale dark:text-white dark:hover:bg-white/10 ${
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
                  onClick={handleRemove}
                  title={t('remove')}
                  className="h-8 w-8 text-gray-900 hover-scale hover:bg-gray-100 dark:text-white dark:hover:bg-white/10"
                >
                  <Trash className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>

            <div className="animate-fade-in flex items-center gap-6">
              <WeatherIcon code={String(cityLocale.current.codeId)} icon={cityLocale.current.icon} size={80} className="text-7xl text-brand-400" />
              <div className="flex flex-col gap-2">
                <p className="text-base font-medium text-gray-600 dark:text-white/70">{cityWeather.country[locale]}</p>
                <WeatherTimeNow
                  timezone={cityLocale.current.timezone}
                  userTimezoneOffset={getUserTimezoneOffset()}
                  isSameTimezone={isSameTimezone(cityLocale.current.timezone, getUserTimezoneOffset())}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="hover-lift flex flex-col items-center gap-2 rounded-2xl border border-yellow-200/50 bg-yellow-50/80 p-4 text-center transition-all dark:border-white/5 dark:bg-white/10">
                <Sunrise className="text-lg text-orange-400 dark:text-orange-300" aria-hidden="true" />
                <p className="text-xl font-semibold text-gray-900 tabular-nums dark:text-white/90" dir="ltr">
                  {cityLocale.current.sunrise !== null && cityLocale.current.sunrise !== undefined
                    ? formatTimeWithTimezone(cityLocale.current.sunrise, cityLocale.current.timezone)
                    : '--:--'}
                </p>
                <p className="text-xs font-medium text-gray-600 dark:text-white/70">{t('sunrise')}</p>
              </div>
              <div className="hover-lift flex flex-col items-center gap-2 rounded-2xl border border-orange-200/50 bg-orange-50/80 p-4 text-center transition-all dark:border-white/5 dark:bg-white/10">
                <Sunset className="text-lg text-orange-500 dark:text-orange-400" aria-hidden="true" />
                <p className="text-xl font-semibold text-gray-900 tabular-nums dark:text-white/90" dir="ltr">
                  {cityLocale.current.sunset !== null && cityLocale.current.sunset !== undefined
                    ? formatTimeWithTimezone(cityLocale.current.sunset, cityLocale.current.timezone)
                    : '--:--'}
                </p>
                <p className="text-xs font-medium text-gray-600 dark:text-white/70">{t('sunset')}</p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-600 dark:text-white/50" aria-live="polite">
                {t('lastUpdated')} <span dir="ltr">{formatTimeWithTimezone(cityWeather.lastUpdated / 1000, cityLocale.current.timezone)}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-5 border-t border-black/5 pt-8 dark:border-white/5">
          {cityWeather.hourly && cityWeather.hourly.length > 0 ? (
            <HourlyForecast hourly={cityWeather.hourly} cityUnit={cityWeather.unit as TemporaryUnit} unit={unit as TemporaryUnit} />
          ) : null}
          <ForecastList cityUnit={cityWeather.unit as TemporaryUnit} forecast={cityWeather.forecast} unit={unit as TemporaryUnit} />
        </div>
      </section>
    </div>
  );
};

export default WeatherCardContent;


