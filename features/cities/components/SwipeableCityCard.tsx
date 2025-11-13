'use client';

import type { MouseEvent as ReactMouseEvent } from 'react';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useWeatherStore } from '@/store/useWeatherStore';
import { hapticButtonPress } from '@/lib/haptics';
import { AppLocale } from '@/types/i18n';
import type { CityWeather } from '@/types/weather';
import { Card } from '@/components/ui/card';
import DeletedCityCard from './DeletedCityCard';
import CityCardContent from './CityCardContent';
import CityCardActions from './CityCardActions';
import { useLocationRefresh } from '@/features/location/hooks/useLocationRefresh';

export interface SwipeableCityCardProps {
  city: CityWeather;
  index: number;
}

export default function SwipeableCityCard({
  city,
  index
}: SwipeableCityCardProps) {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const router = useRouter();

  const setCurrentIndex = useWeatherStore((s) => s.setCurrentIndex);
  const currentIndex = useWeatherStore((s) => s.currentIndex);
  const unit = useWeatherStore((s) => s.unit);
  const autoLocationCityId = useWeatherStore((s) => s.autoLocationCityId);
  const removeCity = useWeatherStore((s) => s.removeCity);
  const showToast = useWeatherStore((s) => s.showToast);
  const { isRefreshingLocation, handleRefreshLocation: handleLocationRefresh } = useLocationRefresh();

  const [deletedCity, setDeletedCity] = useState<CityWeather | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const cityName = city.name[locale] || city.name.en;
  const isCurrentLocation = city.id === autoLocationCityId;
  const isActiveCity = index === currentIndex;

  // Handle delete function
  const handleDelete = () => {
    setDeletedCity(city);
  };

  const handleClick = () => {
    hapticButtonPress();
    setCurrentIndex(index);
    router.push(`/${locale}`);
  };

  const handleUndo = () => {
    setDeletedCity(null);
    showToast({
      message: 'toasts.cityRestored',
      type: 'info',
      values: { city: cityName }
    });
  };

  const handleConfirmDelete = () => {
    removeCity(city.id);
    setDeletedCity(null);
    showToast({
      message: 'toasts.cityDeleted',
      type: 'success',
      values: { city: cityName },
      duration: 3000
    });
  };

  // Handle location refresh for current location
  const handleRefreshLocation = async (e: ReactMouseEvent) => {
    e.stopPropagation();
    hapticButtonPress();
    await handleLocationRefresh(e);
  };

  // If city is deleted, show undo option
  if (deletedCity) {
    return (
      <DeletedCityCard
        cityName={cityName}
        onUndo={handleUndo}
        onConfirmDelete={handleConfirmDelete}
      />
    );
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0
      }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="relative w-full"
    >
      <Card
        className={`w-full p-4 cursor-pointer backdrop-blur-md rounded-2xl shadow-sm transition-all duration-200 select-none ${isActiveCity
          ? 'bg-sky-100/80 dark:bg-sky-900/30 border-2 border-sky-500 dark:border-sky-400 ring-2 ring-sky-500/20 shadow-lg'
          : 'bg-white/60 dark:bg-white/5 border border-white/10 hover:shadow-md'
          } cursor-pointer`}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-label={`${t('cities.viewWeather')} ${cityName}${isCurrentLocation ? ` - ${t('cities.currentLocation')}` : ''}${isActiveCity ? ` - ${t('cities.nowShowing')}` : ''}`}
        aria-current={isActiveCity ? 'true' : 'false'}
      >
        <div className="flex items-center justify-between">
          <CityCardContent
            city={city}
            locale={locale}
            unit={unit}
            isCurrentLocation={isCurrentLocation}
          />
          <CityCardActions
            isCurrentLocation={isCurrentLocation}
            isRefreshingLocation={isRefreshingLocation}
            onRefreshLocation={handleRefreshLocation}
            onDelete={handleDelete}
          />
        </div>
      </Card>
    </motion.div>
  );
}
