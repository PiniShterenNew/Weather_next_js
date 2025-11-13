'use client';

import { MapPin } from 'lucide-react';
import { WeatherIcon } from '@/features/weather/components/WeatherIcon';
import { formatTemperatureWithConversion } from '@/lib/helpers/formatters';
import { AppLocale } from '@/types/i18n';
import type { CityWeather } from '@/types/weather';
import type { TemporaryUnit } from '@/types/ui';

export interface CityCardContentProps {
  city: CityWeather;
  locale: AppLocale;
  unit: TemporaryUnit;
  isCurrentLocation: boolean;
}

export default function CityCardContent({
  city,
  locale,
  unit,
  isCurrentLocation
}: CityCardContentProps) {
  const cityName = city.name[locale] || city.name.en;
  const currentTemp = city.current?.temp;
  const weatherCode = city.current?.codeId || 800;
  const weatherIcon = city.current?.icon || '01d';
  
  // City data is stored in metric, convert if needed
  const cityUnit: TemporaryUnit = 'metric';
  const displayTemp = currentTemp
    ? formatTemperatureWithConversion(currentTemp, cityUnit, unit)
    : '--°';

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center justify-between gap-3">
        {/* City Name */}
        <div className="flex-1 min-w-0">
          <h3 className={`text-base ${isCurrentLocation ? 'font-bold' : 'font-semibold'} text-neutral-800 dark:text-white/90 flex items-center gap-1.5`}>
            <span className="truncate">{cityName}</span>
            {isCurrentLocation && (
              <span 
                className="inline-flex animate-pulse flex-shrink-0" 
                title="Current Location"
                aria-label="Current Location"
                role="img"
              >
                <MapPin className="h-4 w-4 text-sky-500 dark:text-sky-400" aria-hidden="true" />
              </span>
            )}
          </h3>
          {city.country && (
            <p className="text-xs text-neutral-600 dark:text-white/80 truncate">
              {city.country[locale] || city.country.en}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <WeatherIcon
            code={weatherCode.toString()}
            icon={weatherIcon}
            size={48}
            className="h-12 w-12"
          />
          <div className={`text-2xl ${isCurrentLocation ? 'font-extrabold' : 'font-bold'} text-sky-600 dark:text-sky-400`}>
            {displayTemp}
          </div>
        </div>
      </div>
    </div>
  );
}

