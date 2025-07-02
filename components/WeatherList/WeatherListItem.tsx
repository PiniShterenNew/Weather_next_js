'use client';
import React, { forwardRef } from 'react';
import { useWeatherStore } from '@/stores/useWeatherStore';
import type { City } from '@/types/weather';
import { LocateFixed } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatTemperatureWithConversion } from '../../lib/helpers';
import { WeatherIcon } from '../WeatherCard/WeatherIcon';
import { cn } from '@/lib/utils';

type Properties = {
  city: City;
  isCurrentIndex: boolean;
  onClick?: () => void;
};

const WeatherListItem = forwardRef<HTMLButtonElement, Properties>(
  ({ city, isCurrentIndex, onClick }, ref) => {
    const t = useTranslations();
    const unit = useWeatherStore((s) => s.unit);
    const autoLocationCityId = useWeatherStore((s) => s.autoLocationCityId);

    return (
      <button
        ref={ref}
        className={cn(
          "w-full p-5 rounded-xl bg-card text-card-foreground shadow-md border border-border flex flex-row align-center justify-between gap-4",
          isCurrentIndex ? "bg-primary text-primary-foreground" : ""
        )}
        onClick={onClick}
      >
        <div className="flex flex-col items-start justify-center">
          <h2 className="text-xl font-semibold flex items-center flex-row gap-2">
            {city.name}{' '}
            {city.isCurrentLocation || city.id === autoLocationCityId ? (
              <LocateFixed size={18} role="presentation" data-testid="location-icon" />
            ) : null}
          </h2>
          <p className="text-sm opacity-70">{city.country}</p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <div className="relative">
            <WeatherIcon
              code={city.current.icon}
              alt={city.current.desc}
              size={50}
              priority
              className="shrink-0"
            />
          </div>
          <div className="flex flex-col items-center">
            <div className="relative text-2xl font-bold">
              {formatTemperatureWithConversion(city.current.temp, city.unit, unit)}
            </div>
            <p className="text-sm capitalize">{city.current.desc}</p>
            <p className="text-xs opacity-70">
              {t('feelsLike')} {formatTemperatureWithConversion(city.current.feelsLike, city.unit, unit)}
            </p>
          </div>
        </div>
      </button>
    );
  }
);

WeatherListItem.displayName = 'WeatherListItem';
export default WeatherListItem;
