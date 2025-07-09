// components/WeatherList/WeatherListItem.tsx
'use client';
import React, { forwardRef } from 'react';
import { useWeatherStore } from '@/stores/useWeatherStore';
import type { CityWeather, CityWeatherCurrent } from '@/types/weather';
import { Building2, Droplets, Eye, Wind } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { formatTemperatureWithConversion, formatVisibility, formatWindSpeed, getWindDirection } from '../../lib/helpers';
import { WeatherIcon } from '../WeatherIcon/WeatherIcon';
import { cn, removeParentheses } from '@/lib/utils';
import { AppLocale } from '@/types/i18n';
import { motion } from 'framer-motion';

type Properties = {
  cityCurrent: CityWeatherCurrent;
  city: CityWeather;
  isCurrentIndex: boolean;
  onClick?: () => void;
};

const WeatherListItem = forwardRef<HTMLButtonElement, Properties>(
  ({ cityCurrent, city, isCurrentIndex, onClick }, ref) => {
    const t = useTranslations();
    const locale = useLocale() as AppLocale;
    const unit = useWeatherStore((s) => s.unit);
    const autoLocationCityId = useWeatherStore((s) => s.autoLocationCityId);
    const currentLocation = city.id === autoLocationCityId;
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "w-full px-4 py-3 rounded-xl bg-card text-card-foreground flex flex-col align-center justify-between gap-4",
          isCurrentIndex ? "border-primary border-2" : "",
        )}
        onClick={onClick}
      >
        <div className='flex flex-row items-center justify-between'>
          <div className="flex flex-row items-center justify-center gap-2">
            <Building2 className="h-5 w-5 shrink-0" />
            <div className="flex flex-col items-start justify-center">
              <h2 className="text-sm leading-3 font-semibold flex items-center flex-row gap-2">
                {removeParentheses(city.name[locale])}
                {currentLocation ? (
                  <WeatherIcon data-testid="location-icon" icon="location" size={16} />
                ) : null}
              </h2>
              <p className="text-xs opacity-70">{city.country[locale]}</p>
            </div>
          </div>
          <div className="relative text-2xl font-medium">
            {formatTemperatureWithConversion(cityCurrent.current.temp, cityCurrent.unit, unit)}
          </div>
        </div>
        <div className="flex items-center justify-start gap-2">
          <div className="relative">
            <WeatherIcon
              code={cityCurrent.current.icon}
              icon={null}
              alt={cityCurrent.current.desc}
              size={30}
              priority
              className="shrink-0"
            />
          </div>
          <div className="flex flex-col items-center">
            <p className="text-sm capitalize">{t(`weather.conditions.${cityCurrent.current.codeId}.description`)}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          {[ // values to animate
            { value: `${cityCurrent.current.humidity}%`, icon: <Droplets className="h-4 w-4 text-blue-500" /> },
            { value: `${formatWindSpeed(cityCurrent.current.wind, cityCurrent.unit)} ${getWindDirection(cityCurrent.current.windDeg)}`, icon: <Wind className="h-4 w-4 text-blue-400" /> },
            { value: formatVisibility(cityCurrent.current.visibility), icon: <Eye className="h-4 w-4 text-amber-500" /> },
          ].map((item, index) => (
            <motion.div
              key={item.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="flex flex-col items-center justify-center gap-1"
            >
              <div className="flex flex-row items-center justify-center gap-2">
                {item.icon}
                <p className="font-normal text-xs">{item.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.button>
    );
  }
);

WeatherListItem.displayName = 'WeatherListItem';
export default WeatherListItem;