'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { Loader2, MapPin, Navigation, RotateCcw, Sunrise, Sunset, Trash } from 'lucide-react';

import ForecastListSkeleton from '@/components/skeleton/ForecastListSkeleton';
import { Button } from '@/components/ui/button';
import { WeatherIcon } from '@/features/weather/components/WeatherIcon';
import WeatherDetails from '@/features/weather/components/WeatherDetails';
import WeatherTimeNow from '@/features/weather/components/WeatherTimeNow';
import { useCityManagement } from '@/hooks/useCityManagement';
import { useWeatherStore } from '@/store/useWeatherStore';
import type { AppLocale } from '@/types/i18n';
import type { CityWeather, CityWeatherCurrent } from '@/types/weather';
import type { TemporaryUnit } from '@/types/ui';
import { formatTemperatureWithConversion, formatTimeWithTimezone, isSameTimezone } from '@/lib/helpers';

import CityHeader from './CityHeader';
import { colors, spacing, borderRadius, shadows, components } from '@/config/tokens';

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
  const autoLocationCityId = useWeatherStore((state) => state.autoLocationCityId);
  const getUserTimezoneOffset = useWeatherStore((state) => state.getUserTimezoneOffset);
  const isCurrentLocation = cityWeather.id === autoLocationCityId;

  return (
    <div
      className={`scrollbar-hide h-full overflow-y-auto overflow-x-hidden scroll-smooth transition-all duration-300 w-full max-w-full ${
        isRefreshing ? 'opacity-60' : 'opacity-100'
      }`}
      role="article"
      aria-labelledby="city-name"
      style={{ touchAction: 'pan-y pan-x pinch-zoom' }}
    >
      <div className="flex flex-col gap-4 pb-8 pl-4 pr-4 pt-4 md:pl-6 md:pr-6 md:pt-6 xl:pl-8 xl:pr-8 xl:pt-8 lg:hidden min-w-0">
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

      <section className="hidden lg:block w-full max-w-full overflow-x-hidden" style={{ padding: components.card.padding.lg }}>
        <div
          className="mx-auto"
          style={{
            maxWidth: '72rem',
            backgroundColor: colors.background.elevated,
            borderRadius: borderRadius.xl,
            boxShadow: shadows.sm,
            padding: components.card.padding.lg,
            overflowX: 'hidden',
          }}
        >
          <div
            className="grid items-start"
            style={{
              gridTemplateColumns: '3fr 2fr',
              gap: spacing[8],
              minWidth: '0',
            }}
          >
            {/* Left: HERO + Hourly + 5-day */}
            <div className="flex flex-col min-w-0" style={{ gap: spacing[6] }}>
              {/* HERO */}
              <div className="animate-scale-in text-center">
                <p className="tabular-nums" style={{ fontSize: '6rem', fontWeight: 300, color: colors.foreground.primary }}>
                  {formatTemperatureWithConversion(cityLocale.current.temp, cityLocale.unit as TemporaryUnit, unit as TemporaryUnit)}
                </p>
                <p style={{ marginTop: spacing[4], fontSize: '1.25rem', fontWeight: 500, color: colors.foreground.card }} className="capitalize">
                  {cityLocale.current.desc}
                </p>
                <div style={{ marginTop: spacing[4] }} className="text-center">
                  <p style={{ fontSize: '1.125rem', color: colors.foreground.muted }}>
                    {t('feelsLike')}{' '}
                    {cityLocale.current.feelsLike !== null
                      ? formatTemperatureWithConversion(
                          cityLocale.current.feelsLike,
                          cityLocale.unit as TemporaryUnit,
                          unit as TemporaryUnit,
                        )
                      : '--'}
                  </p>
                </div>
                {cityLocale.current.tempMin !== undefined && cityLocale.current.tempMax !== undefined ? (
                  <div
                    className="animate-fade-in flex items-center justify-center text-sm tabular-nums"
                    style={{ marginTop: spacing[4], gap: spacing[4] }}
                  >
                    <div
                      className="hover-scale flex items-center transition-all"
                      style={{
                        gap: spacing[2],
                        borderRadius: borderRadius.lg,
                        border: `1px solid hsl(0 84% 60% / 0.3)`,
                        backgroundColor: 'hsl(0 84% 60% / 0.08)',
                        padding: '0.75rem 1rem',
                      }}
                    >
                      <span className="text-lg font-bold" style={{ color: 'hsl(0 84% 60%)' }} aria-label={t('high')}>
                        ↑
                      </span>
                      <span className="text-lg font-bold" style={{ color: colors.foreground.primary }}>
                        {formatTemperatureWithConversion(cityLocale.current.tempMax, cityLocale.unit as TemporaryUnit, unit as TemporaryUnit)}
                      </span>
                    </div>
                    <div
                      className="hover-scale flex items-center transition-all"
                      style={{
                        gap: spacing[2],
                        borderRadius: borderRadius.lg,
                        border: `1px solid hsl(210 83% 53% / 0.3)`,
                        backgroundColor: 'hsl(210 83% 53% / 0.08)',
                        padding: '0.75rem 1rem',
                      }}
                    >
                      <span className="text-lg font-bold" style={{ color: 'hsl(210 83% 53%)' }} aria-label={t('low')}>
                        ↓
                      </span>
                      <span className="text-lg font-bold" style={{ color: colors.foreground.primary }}>
                        {formatTemperatureWithConversion(cityLocale.current.tempMin, cityLocale.unit as TemporaryUnit, unit as TemporaryUnit)}
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Hourly Forecast */}
              <div
                className="rounded-xl w-full min-w-0 overflow-x-hidden"
                style={{
                  backgroundColor: colors.background.overlay,
                  padding: components.card.padding.md,
                }}
              >
                {cityWeather.hourly && cityWeather.hourly.length > 0 ? (
                  <HourlyForecast
                    hourly={cityWeather.hourly}
                    cityUnit={cityWeather.unit as TemporaryUnit}
                    unit={unit as TemporaryUnit}
                    timezone={cityLocale.current.timezone}
                  />
                ) : null}
              </div>

              {/* 5-day Forecast */}
              <div>
                <ForecastList
                  cityUnit={cityWeather.unit as TemporaryUnit}
                  forecast={cityWeather.forecast}
                  unit={unit as TemporaryUnit}
                />
              </div>
            </div>

            {/* Right: Meta + Actions + Metrics */}
            <div className="flex flex-col min-w-0" style={{ gap: spacing[6] }} data-drag-handle>
              {/* Title + Actions */}
              <div className="flex items-center justify-between">
                <h1 id="city-name" className="animate-slide-up flex items-center gap-2" style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.foreground.primary }}>
                  {isCurrentLocation ? (
                    <div title={t('cities.currentLocation')} aria-label={t('cities.currentLocation')}>
                      <MapPin className="h-5 w-5 flex-shrink-0 animate-pulse" style={{ color: 'hsl(199 89% 48%)' }} aria-hidden="true" />
                    </div>
                  ) : null}
                  <span className="truncate max-w-full">{cityWeather.name[locale] || cityWeather.name.en}</span>
                </h1>
                <div className="flex" style={{ gap: spacing[2] }}>
                  {isCurrentLocation && handleRefreshLocation ? (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleRefreshLocation}
                      title={t('cities.refreshLocation')}
                      disabled={isRefreshingLocation}
                    >
                      {isRefreshingLocation ? (
                        <Loader2 className="h-4 w-4 animate-spin" style={{ color: colors.info || 'hsl(var(--brand-500))' }} aria-hidden="true" />
                      ) : (
                        <Navigation className="h-4 w-4" style={{ color: '#FACC15' }} aria-hidden="true" />
                      )}
                    </Button>
                  ) : null}
                  <Button size="icon" variant="ghost" onClick={handleRefresh} title={t('refresh')} disabled={isRefreshing}>
                    {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <RotateCcw className="h-4 w-4" aria-hidden="true" />}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={handleRemove} title={t('remove')}>
                    <Trash className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>

              {/* City meta */}
              <div className="animate-fade-in flex items-center" style={{ gap: spacing[6] }}>
                <WeatherIcon code={String(cityLocale.current.codeId)} icon={cityLocale.current.icon} size={80} className="text-7xl text-brand-400" />
                <div className="flex flex-col min-w-0" style={{ gap: spacing[2] }}>
                  <p className="truncate" style={{ fontSize: '1rem', fontWeight: 500, color: colors.foreground.muted }}>{cityWeather.country[locale]}</p>
                  <WeatherTimeNow
                    timezone={cityLocale.current.timezone}
                    userTimezoneOffset={getUserTimezoneOffset()}
                    isSameTimezone={isSameTimezone(cityLocale.current.timezone, getUserTimezoneOffset())}
                  />
                </div>
              </div>

              {/* Sunrise / Sunset */}
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: spacing[3] }}>
                <div
                  className="hover-lift text-center"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: spacing[2],
                    borderRadius: borderRadius.xl,
                    border: `1px solid hsl(48 96% 88% / 0.5)`,
                    background: 'hsl(48 96% 88% / 0.5)',
                    padding: components.card.padding.sm,
                  }}
                >
                  <Sunrise className="text-lg" style={{ color: 'hsl(30 80% 65%)' }} aria-hidden="true" />
                  <p className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 600, color: colors.foreground.primary }} dir="ltr">
                    {cityLocale.current.sunrise !== null && cityLocale.current.sunrise !== undefined
                      ? formatTimeWithTimezone(cityLocale.current.sunrise, cityLocale.current.timezone)
                      : '--:--'}
                  </p>
                  <p style={{ fontSize: '0.75rem', fontWeight: 500, color: colors.foreground.muted }}>{t('sunrise')}</p>
                </div>
                <div
                  className="hover-lift text-center"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: spacing[2],
                    borderRadius: borderRadius.xl,
                    border: `1px solid hsl(33 96% 88% / 0.5)`,
                    background: 'hsl(33 96% 88% / 0.5)',
                    padding: components.card.padding.sm,
                  }}
                >
                  <Sunset className="text-lg" style={{ color: 'hsl(260 75% 65%)' }} aria-hidden="true" />
                  <p className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 600, color: colors.foreground.primary }} dir="ltr">
                    {cityLocale.current.sunset !== null && cityLocale.current.sunset !== undefined
                      ? formatTimeWithTimezone(cityLocale.current.sunset, cityLocale.current.timezone)
                      : '--:--'}
                  </p>
                  <p style={{ fontSize: '0.75rem', fontWeight: 500, color: colors.foreground.muted }}>{t('sunset')}</p>
                </div>
              </div>

              {/* Metrics */}
              <div>
                <WeatherDetails cityLocale={cityLocale} _locale={locale} />
              </div>

              {/* Last updated */}
              <div className="text-center">
                <p style={{ fontSize: '0.75rem', color: colors.foreground.muted }} aria-live="polite">
                  {t('lastUpdated')}{' '}
                  <span dir="ltr">{formatTimeWithTimezone(cityWeather.lastUpdated / 1000, cityLocale.current.timezone)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WeatherCardContent;


