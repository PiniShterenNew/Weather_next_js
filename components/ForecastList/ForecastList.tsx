'use client';

import { formatDate, formatTemperature } from '@/lib/helpers';
import { AppLocale } from '@/types/i18n';
import type { WeatherForecastItem } from '@/types/weather';
import { useLocale, useTranslations } from 'next-intl';
import { WeatherIcon } from '../WeatherCard/WeatherIcon';
import { TemporaryUnit } from '@/types/ui';

export interface ForecastListProperties {
  forecast: WeatherForecastItem[];
  unit: TemporaryUnit;
}

export function ForecastListComponent({ forecast, unit }: ForecastListProperties) {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;

  return (
    <div className="w-full mt-6">
      <h3 className="text-lg font-semibold mb-3" role="heading">{t('forecast')}</h3>
      <div className="space-y-2">
        {forecast.map((day, index) => (
          <div
            key={index}
            data-testid="forecast-item"
            className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors"
          >
            <span className="w-24" data-testid="forecast-date">{formatDate(day.date, locale)}</span>
            <div className="flex items-center gap-6">
              <WeatherIcon
                code={day.icon}
                alt={day.desc}
                size={32}
                title={day.desc}
                className="shrink-0"
                priority={index < 3}
              />
              <span data-testid="forecast-max" className="text-right">{formatTemperature(day.max, unit)}</span>
              <span data-testid="forecast-min" className="text-right opacity-60">{formatTemperature(day.min, unit)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ייצוא ברירת המחדל לצורך תאימות לאחור
export default ForecastListComponent;
