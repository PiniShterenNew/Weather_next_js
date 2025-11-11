'use client';

import { formatTemperatureWithConversion } from '@/lib/helpers';
import { WeatherHourlyItem } from '@/types/weather';
import { TemporaryUnit } from '@/types/ui';
import { WeatherIcon } from '@/components/WeatherIcon/WeatherIcon';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Wind } from 'lucide-react';
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
    <div className="animate-fade-in bg-blue-50/30 dark:bg-blue-950/20 rounded-2xl p-4 border border-blue-200/30 dark:border-blue-800/30" data-testid="hourly-forecast">
      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
        <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
        {locale === 'he' ? 'תחזית שעתית' : 'Hourly Forecast'}
      </h3>
      
      {/* גלילה אופקית - לכל הגדלים */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {hourly.slice(0, 12).map((hour, index) => {
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
