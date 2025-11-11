'use client';

import { forwardRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Eye, MapPin, Wind } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { formatTemperatureWithConversion, formatVisibility, formatWindSpeed } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useWeatherStore } from '@/store/useWeatherStore';
import type { AppLocale } from '@/types/i18n';
import type { CityWeather, CityWeatherCurrent } from '@/types/weather';
import type { TemporaryUnit } from '@/types/ui';
import { WeatherIcon } from '@/components/WeatherIcon/WeatherIcon';

interface WeatherListItemProps {
  cityCurrent: CityWeatherCurrent;
  city: CityWeather;
  isCurrentIndex: boolean;
  onClick?: () => void;
}

const getTempGradient = (temperature: number): string => {
  if (temperature > 30) return 'var(--grad-hot)';
  if (temperature > 25) return 'var(--grad-warm)';
  if (temperature > 15) return 'var(--grad-mild)';
  if (temperature > 10) return 'var(--grad-cool)';
  return 'var(--grad-cold)';
};

const WeatherListItem = forwardRef<HTMLButtonElement, WeatherListItemProps>(
  ({ cityCurrent, city, isCurrentIndex, onClick }, ref) => {
    const t = useTranslations();
    const locale = useLocale() as AppLocale;
    const unit = useWeatherStore((state) => state.unit);
    const autoLocationCityId = useWeatherStore((state) => state.autoLocationCityId);
    const currentLocation = city.id === autoLocationCityId;

    const temperature = cityCurrent.current.temp;
    const gradient = useMemo(() => getTempGradient(temperature), [temperature]);

    return (
      <motion.button
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.02, y: -3 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'group relative flex w-full flex-col gap-4 overflow-hidden rounded-2xl',
          'min-h-touch-target-comfortable transition-all duration-300 ease-out',
          'shadow-lg hover:shadow-2xl',
          isCurrentIndex
            ? 'border-2 border-sky-500 dark:border-sky-400 ring-2 ring-sky-500/30 dark:ring-sky-400/30 ring-offset-2 dark:ring-offset-gray-900'
            : 'border border-white/20 dark:border-gray-700/50',
        )}
        onClick={onClick}
        aria-current={isCurrentIndex}
        role="listitem"
      >
        <div
          className={cn('absolute inset-0', isCurrentIndex ? 'opacity-40 dark:opacity-30' : 'opacity-30 dark:opacity-20')}
          style={{ background: gradient }}
        />

        <div
          className={cn(
            'absolute inset-0 backdrop-blur-xl',
            isCurrentIndex ? 'bg-sky-50/95 dark:bg-sky-950/90' : 'bg-white/90 dark:bg-gray-800/90',
          )}
        />

        <div className="relative flex flex-col gap-3 p-5">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-0.5">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                {city.name[locale] || city.name.en}
                {currentLocation ? (
                  <span className="inline-flex animate-pulse" title={t('cities.currentLocation')}>
                    <MapPin data-testid="location-icon" className="h-4 w-4 text-sky-500 dark:text-sky-400" aria-hidden="true" />
                  </span>
                ) : null}
              </h2>
              <p className="text-xs font-medium text-gray-600 opacity-70 dark:text-gray-400">{city.country[locale]}</p>
            </div>

            <div className="flex-shrink-0">
              <WeatherIcon
                code={cityCurrent.current.icon}
                icon={null}
                alt={cityCurrent.current.desc}
                size={36}
                priority
                className="drop-shadow-md"
              />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <p className="text-5xl font-bold text-gray-900 tabular-nums leading-none dark:text-white">
              {formatTemperatureWithConversion(cityCurrent.current.temp, cityCurrent.unit as TemporaryUnit, unit as TemporaryUnit).replace('°', '')}
            </p>
            <span className="text-3xl font-light text-gray-700 dark:text-gray-300">°</span>
          </div>

          <p className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
            {t(`weather.conditions.${cityCurrent.current.codeId}.description`)}
          </p>

          <div className="flex items-center justify-between gap-3 border-t border-gray-200/50 pt-3 dark:border-gray-700/50">
            {[
              {
                value: `${cityCurrent.current.humidity}%`,
                icon: <Droplets className="h-4 w-4 text-blue-500 dark:text-blue-400" />,
                label: t('humidity'),
              },
              {
                value: `${formatWindSpeed(cityCurrent.current.wind, unit as TemporaryUnit).split(' ')[0]}`,
                icon: <Wind className="h-4 w-4 text-teal-500 dark:text-teal-400" />,
                label: 'km/h',
              },
              {
                value: cityCurrent.current.visibility ? formatVisibility(cityCurrent.current.visibility).split(' ')[0] : '--',
                icon: <Eye className="h-4 w-4 text-amber-500 dark:text-amber-400" />,
                label: 'km',
              },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                className="flex items-center gap-1.5"
              >
                {item.icon}
                <span className="text-xs font-semibold text-gray-900 dark:text-white tabular-nums">{item.value}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.button>
    );
  },
);

WeatherListItem.displayName = 'WeatherListItem';

export default WeatherListItem;


