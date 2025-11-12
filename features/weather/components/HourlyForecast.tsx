'use client';

import { formatTemperatureWithConversion, formatTimeWithTimezone } from '@/lib/helpers';
import { WeatherHourlyItem } from '@/types/weather';
import { TemporaryUnit } from '@/types/ui';
import { WeatherIcon } from '@/features/weather/components/WeatherIcon';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Wind } from 'lucide-react';
import { AppLocale } from '@/types/i18n';

interface HourlyForecastProps {
  hourly: WeatherHourlyItem[];
  cityUnit: TemporaryUnit;
  unit: TemporaryUnit;
  timezone: string;
}

export default function HourlyForecast({ hourly, cityUnit, unit, timezone }: HourlyForecastProps) {
  const locale = useLocale() as AppLocale;

  if (!hourly || hourly.length === 0) {
    return null;
  }

  // Get current time in seconds for comparison
  const now = Math.floor(Date.now() / 1000);

  return (
    <div className="animate-fade-in bg-blue-50/30 dark:bg-blue-950/20 rounded-2xl p-4 border border-blue-200/30 dark:border-blue-800/30" data-testid="hourly-forecast">
      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
        <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
        {locale === 'he' ? 'תחזית שעתית' : 'Hourly Forecast'}
      </h3>
      
      {/* גלילה אופקית - לכל הגדלים */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {hourly.slice(0, 12).map((hour, index) => {
          // Convert timestamp (milliseconds) to seconds for formatTimeWithTimezone
          const hourTimeSeconds = Math.floor(hour.time / 1000);
          const formattedTime = formatTimeWithTimezone(hourTimeSeconds, timezone);
          // Check if this hour is within the current hour (within 1 hour from now)
          const isNow = index === 0 && Math.abs(hourTimeSeconds - now) < 3600;
          
          return (
            <motion.div
              key={hour.time}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.2 }}
              className="flex-shrink-0 w-20"
            >
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-3 transition-all hover-lift border border-gray-200/50 dark:border-gray-700/50 text-center">
                {/* שעה */}
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {isNow 
                    ? (locale === 'he' ? 'עכשיו' : 'Now')
                    : formattedTime
                  }
                </p>
                
                {/* אייקון מזג אוויר */}
                <div className="flex justify-center mb-2">
                  <WeatherIcon
                    code={null}
                    icon={hour.icon}
                    alt={hour.desc}
                    size={32}
                    className="text-brand-500 dark:text-brand-400"
                  />
                </div>
                
                {/* טמפרטורה */}
                <p className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
                  {formatTemperatureWithConversion(hour.temp, cityUnit, unit)}
                </p>
                
                {/* מידע נוסף (רוח) */}
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Wind className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {hour.wind?.toFixed(0) || '--'}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}
