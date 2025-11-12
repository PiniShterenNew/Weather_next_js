'use client';

import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useWeatherStore } from '@/store/useWeatherStore';
import { AppLocale } from '@/types/i18n';
import type { CityWeather } from '@/types/weather';
import { Card } from '@/components/ui/card';
import { WeatherIcon } from '@/features/weather/components/WeatherIcon';
import { MapPin } from 'lucide-react';

export interface CompactCityCardProps {
  city: CityWeather;
  index: number;
}

export default function CompactCityCard({ city, index }: CompactCityCardProps) {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const setCurrentIndex = useWeatherStore((s) => s.setCurrentIndex);
  const currentIndex = useWeatherStore((s) => s.currentIndex);
  const unit = useWeatherStore((s) => s.unit);
  const autoLocationCityId = useWeatherStore((s) => s.autoLocationCityId);

  const cityName = city.name[locale] || city.name.en;
  const currentTemp = city.current?.temp;
  const weatherCode = city.current?.codeId || 800;
  const weatherIcon = city.current?.icon || '01d';
  const isCurrentLocation = city.id === autoLocationCityId;
  const isActiveCity = index === currentIndex;

  const displayTemp = currentTemp
    ? `${Math.round(currentTemp)}°${unit === 'metric' ? 'C' : 'F'}`
    : '--°';

  const handleClick = () => {
    setCurrentIndex(index);
    router.push(`/${locale}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={`p-4 cursor-pointer backdrop-blur-md rounded-2xl shadow-sm transition-all duration-200 ${
          isActiveCity
            ? 'bg-sky-100/80 dark:bg-sky-900/30 border-2 border-sky-500 dark:border-sky-400 ring-2 ring-sky-500/20 shadow-lg'
            : 'bg-white/60 dark:bg-white/5 border border-white/10 hover:shadow-md'
        }`}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-label={`${t('cities.viewWeather')} ${cityName}, ${displayTemp}${isCurrentLocation ? ` - ${t('cities.currentLocation')}` : ''}${isActiveCity ? ` - ${t('cities.nowShowing')}` : ''}`}
        aria-current={isActiveCity ? 'true' : 'false'}
      >
        <div className="flex items-center justify-between gap-3">
          {/* City Name */}
          <div className="flex-1 min-w-0">
            <h3 className={`text-base ${isCurrentLocation ? 'font-bold' : 'font-semibold'} text-neutral-800 dark:text-white/90 flex items-center gap-1.5`}>
              <span className="truncate">{cityName}</span>
              {isCurrentLocation && (
                <span 
                  className="inline-flex animate-pulse flex-shrink-0" 
                  title={t('cities.currentLocation')}
                  aria-label={t('cities.currentLocation')}
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

          {/* Weather Icon & Temp */}
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
      </Card>
    </motion.div>
  );
}

