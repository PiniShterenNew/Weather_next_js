'use client';

import { formatDate, formatTemperatureWithConversion } from '@/lib/helpers';
import { AppLocale } from '@/types/i18n';
import type { WeatherForecastItem } from '@/types/weather';
import { useLocale, useTranslations } from 'next-intl';
import { WeatherIcon } from '../WeatherCard/WeatherIcon';
import { TemporaryUnit } from '@/types/ui';

export interface ForecastListProperties {
  forecast: WeatherForecastItem[];
  cityUnit: TemporaryUnit;
  unit: TemporaryUnit;
}

export function ForecastListComponent({ forecast, cityUnit, unit }: ForecastListProperties) {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;

  return (
    <div className="w-full mt-6">
      <h3 className="text-lg font-semibold mb-3" role="heading">{t('forecast')}</h3>
      <div className="grid grid-cols-5 gap-10">
        {forecast.map((day, index) => (
          <div
            key={index}
            data-testid="forecast-item"
            className="flex items-center bg-muted/50 flex-col justify-center p-2 gap-2 rounded-lg transition-colors"
          >
            <span className="w-24 text-sm font-medium text-center" data-testid="forecast-date">{formatDate(day.date, locale)}</span>
            <div className="flex flex-col items-center justify-center gap-2">
              <WeatherIcon
                code={day.icon}
                alt={day.desc}
                size={32}
                title={day.desc}
                className="shrink-0"
                priority={index < 3}
              />
              <div className="flex flex-row items-center gap-2">
                <span data-testid="forecast-min" className="text-right opacity-60 text-sm">{formatTemperatureWithConversion(day.min, cityUnit, unit)}</span>
                <span data-testid="forecast-max" className="text-right text-sm">{formatTemperatureWithConversion(day.max, cityUnit, unit)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ייצוא ברירת המחדל לצורך תאימות לאחור
export default ForecastListComponent;
