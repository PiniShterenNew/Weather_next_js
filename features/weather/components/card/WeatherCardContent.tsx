'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

import ForecastListSkeleton from '@/components/skeleton/ForecastListSkeleton';
import WeatherDetails from '@/features/weather/components/WeatherDetails';
import { useCityManagement } from '@/hooks/useCityManagement';
import { useWeatherStore } from '@/store/useWeatherStore';
import type { AppLocale } from '@/types/i18n';
import type { CityWeather, CityWeatherCurrent } from '@/types/weather';
import type { TemporaryUnit } from '@/types/ui';
import { formatTimeWithTimezone } from '@/lib/helpers';

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
    handleRefreshLocation,
    isRefreshingLocation,
  } = useCityManagement(cityWeather, locale);
  const unit = useWeatherStore((state) => state.unit);

  return (
    <div
      className={`scrollbar-hide h-full overflow-y-auto overflow-x-hidden w-full max-w-full transition-opacity duration-200 ${
        isRefreshing ? 'opacity-60' : 'opacity-100'
      }`}
      role="article"
      aria-labelledby="city-name"
      style={{ touchAction: 'pan-y pinch-zoom' }}
    >
      <div className="flex flex-col gap-4 pb-8 pl-4 pr-4 pt-4 md:pl-6 md:pr-6 md:pt-6 xl:pl-8 xl:pr-8 xl:pt-8 min-w-0">
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
            <HourlyForecast 
              hourly={cityWeather.hourly} 
              cityUnit={cityWeather.unit as TemporaryUnit} 
              unit={unit as TemporaryUnit}
              timezone={cityLocale.current.timezone}
            />
          ) : null}

          <ForecastList cityUnit={cityWeather.unit as TemporaryUnit} forecast={cityWeather.forecast} unit={unit as TemporaryUnit} />

          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-white/80" aria-live="polite">
              {t('lastUpdated')} <span dir="ltr">{formatTimeWithTimezone(cityWeather.lastUpdated / 1000, cityLocale.current.timezone)}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCardContent;


