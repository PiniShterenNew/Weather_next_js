'use client';

import { formatDate, formatTemperatureWithConversion } from '@/lib/helpers';
import { AppLocale } from '@/types/i18n';
import type { WeatherForecastItem } from '@/types/weather';
import { useLocale } from 'next-intl';
import { WeatherIcon } from '../WeatherIcon/WeatherIcon';
import { TemporaryUnit } from '@/types/ui';
import { motion } from 'framer-motion';
import { Wind, Droplets, Cloud } from 'lucide-react';

export interface ForecastListProperties {
  forecast: WeatherForecastItem[];
  cityUnit: TemporaryUnit;
  unit: TemporaryUnit;
}

export default function ForecastList({ forecast, cityUnit, unit }: ForecastListProperties) {
  const locale = useLocale() as AppLocale;

  return (
    <div className="animate-fade-in" data-testid="forecast-list">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90 mb-3" data-testid="forecast-title">
        {locale === 'he' ? 'תחזית 5 ימים' : '5-Day Forecast'}
      </h3>
      <div className="flex flex-col gap-3">
        {forecast.map((day, index) => {
          const tempDiff = day.max - day.min;
          const isWarming = tempDiff > 10;
          const isCooling = tempDiff < 5;
          
          return (
            <motion.div
              key={index}
              data-testid="forecast-item"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="w-full"
            >
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-4 transition-all hover-lift border border-gray-200/50 dark:border-gray-700/50">
                {/* שורה עליונה - תאריך, אייקון וטמפרטורות */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4 flex-1">
                    <p className="text-sm font-semibold text-foreground min-w-[80px]" data-testid="forecast-date">
                      {formatDate(day.date / 1000, locale)}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <WeatherIcon
                        code={day.icon}
                        icon={null}
                        alt={day.desc}
                        size={40}
                        title={day.desc}
                        className="text-brand-500 dark:text-brand-400"
                        priority={index < 3}
                      />
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-4 ${locale === 'he' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`text-xl font-bold tabular-nums ${isWarming ? 'text-red-500 dark:text-orange-400' : 'text-foreground'}`} data-testid="forecast-max">
                      {formatTemperatureWithConversion(day.max, cityUnit, unit)}
                    </div>
                    <div className={`text-base font-medium tabular-nums ${isCooling ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} data-testid="forecast-min">
                      {formatTemperatureWithConversion(day.min, cityUnit, unit)}
                    </div>
                  </div>
                </div>

                {/* שורה תחתונה - מידע נוסף */}
                {(day.wind !== undefined || day.humidity !== undefined || day.clouds !== undefined) && (
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                    {day.wind !== undefined && (
                      <div className="flex items-center gap-1">
                        <Wind className="h-3 w-3" />
                        <span>{day.wind} km/h</span>
                      </div>
                    )}
                    {day.humidity !== undefined && (
                      <div className="flex items-center gap-1">
                        <Droplets className="h-3 w-3" />
                        <span>{day.humidity}%</span>
                      </div>
                    )}
                    {day.clouds !== undefined && (
                      <div className="flex items-center gap-1">
                        <Cloud className="h-3 w-3" />
                        <span>{day.clouds}%</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

