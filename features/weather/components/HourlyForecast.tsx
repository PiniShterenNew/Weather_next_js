'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Wind } from 'lucide-react';

import { WeatherIcon } from '@/features/weather/components/WeatherIcon';
import { formatTemperatureWithConversion, formatTimeWithTimezone } from '@/lib/helpers';
import { AppLocale } from '@/types/i18n';
import { WeatherHourlyItem } from '@/types/weather';
import { TemporaryUnit } from '@/types/ui';

interface HourlyForecastProps {
  hourly: WeatherHourlyItem[];
  cityUnit: TemporaryUnit;
  unit: TemporaryUnit;
  timezone: string;
}

const HourlyForecastSkeleton = () => (
  <div className="space-y-3" data-testid="hourly-forecast-skeleton" aria-hidden="true">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-6 w-1 rounded-full bg-blue-300" />
        <span className="h-4 w-32 rounded-full bg-blue-100/80 dark:bg-blue-900/40" />
      </div>
      <div className="flex gap-2">
        <span className="h-9 w-9 rounded-full bg-blue-100/70 dark:bg-blue-900/30" />
        <span className="h-9 w-9 rounded-full bg-blue-100/50 dark:bg-blue-900/20" />
      </div>
    </div>
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="w-24 flex-shrink-0 rounded-2xl border border-blue-100/60 bg-white/80 p-3 dark:border-blue-900/30 dark:bg-slate-900/40">
          <div className="mb-2 h-3 w-12 rounded-full bg-blue-100/80 dark:bg-blue-900/40" />
          <div className="mb-3 h-8 w-8 rounded-full bg-blue-200/70 dark:bg-blue-800/50 mx-auto" />
          <div className="mb-2 h-4 w-14 rounded-full bg-blue-100/80 dark:bg-blue-900/40" />
          <div className="h-3 w-10 rounded-full bg-blue-50/80 dark:bg-blue-900/30" />
        </div>
      ))}
    </div>
  </div>
);

export default function HourlyForecast({ hourly, cityUnit, unit, timezone }: HourlyForecastProps) {
  const locale = useLocale() as AppLocale;

  const visibleHours = useMemo(() => hourly?.slice(0, 12) || [], [hourly]);

  const now = Math.floor(Date.now() / 1000);

  if (!visibleHours.length) {
    return (
      <div className="animate-fade-in rounded-2xl border border-blue-200/30 bg-blue-50/30 p-4 dark:border-blue-800/30 dark:bg-blue-950/20">
        <HourlyForecastSkeleton />
      </div>
    );
  }

  return (
    <div className="animate-fade-in rounded-2xl border border-blue-200/30 bg-blue-50/30 p-4 dark:border-blue-800/30 dark:bg-blue-950/20" data-testid="hourly-forecast">
      <div className="mb-3 flex items-center gap-3">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-blue-900 dark:text-blue-100">
          <div className="h-6 w-1 rounded-full bg-blue-500" />
          {locale === 'he' ? 'תחזית שעתית' : 'Hourly Forecast'}
        </h3>
      </div>

      <div
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
        style={{
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          overscrollBehaviorX: 'contain',
        }}
        role="list"
        aria-label={locale === 'he' ? 'תחזית לפי שעות' : 'Hourly forecast cards'}
      >
        {visibleHours.map((hour, index) => {
          const hourTimeSeconds = Math.floor(hour.time / 1000);
          const formattedTime = formatTimeWithTimezone(hourTimeSeconds, timezone);
          const isNow = index === 0 && Math.abs(hourTimeSeconds - now) < 3600;

          return (
            <motion.div
              key={hour.time}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.2 }}
              className="flex-shrink-0 snap-start"
              style={{ width: '90px' }}
            >
              <div className="rounded-2xl border border-gray-200/50 bg-white/90 p-3 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700/50 dark:bg-gray-800/90">
                <p className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                  {isNow ? (locale === 'he' ? 'עכשיו' : 'Now') : formattedTime}
                </p>
                <div className="mb-2 flex justify-center">
                  <WeatherIcon
                    code={null}
                    icon={hour.icon}
                    alt={hour.desc}
                    size={32}
                    className="text-brand-500 dark:text-brand-400"
                  />
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
                  {formatTemperatureWithConversion(hour.temp, cityUnit, unit)}
                </p>
                <div className="mt-1 flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Wind className="h-3 w-3" aria-hidden="true" />
                  <span>{hour.wind?.toFixed(0) || '--'}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
