'use client';

import { formatTemperatureWithConversion } from '@/lib/helpers';
import { WeatherHourlyItem } from '@/types/weather';
import { TemporaryUnit } from '@/types/ui';
import { WeatherIcon } from '@/components/WeatherIcon/WeatherIcon';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { AppLocale } from '@/types/i18n';

interface HourlyForecastProps {
  hourly: WeatherHourlyItem[];
  cityUnit: TemporaryUnit;
  unit: TemporaryUnit;
}

export default function HourlyForecast({ hourly, cityUnit, unit }: HourlyForecastProps) {
  const locale = useLocale() as AppLocale;

  if (!hourly || hourly.length === 0) {
    return null;
  }

  return (
    <div className="animate-fade-in" data-testid="hourly-forecast">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90 mb-3">
        {locale === 'he' ? 'תחזית שעתית' : 'Hourly Forecast'}
      </h3>
      
      {/* גלילה אופקית */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {hourly.map((hour, index) => {
          const hourTime = new Date(hour.time);
          const isNow = index === 0;
          
          return (
            <motion.div
              key={hour.time}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="flex-shrink-0 w-20"
            >
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-3 transition-all hover-lift border border-gray-200/50 dark:border-gray-700/50 text-center">
                {/* שעה */}
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {isNow 
                    ? (locale === 'he' ? 'עכשיו' : 'Now')
                    : hourTime.toLocaleTimeString(locale === 'he' ? 'he-IL' : 'en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })
                  }
                </p>
                
                {/* אייקון מזג אוויר */}
                <div className="flex justify-center mb-2">
                  <WeatherIcon
                    code={hour.icon}
                    icon={null}
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
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {hour.wind.toFixed(0)} km/h
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
