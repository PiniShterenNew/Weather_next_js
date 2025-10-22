'use client';

import { useState, useRef, useEffect } from 'react';
import React from 'react';
import { motion } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useWeatherStore } from '@/store/useWeatherStore';
import { AppLocale } from '@/types/i18n';
import type { CityWeather } from '@/types/weather';
import { Card } from '@/components/ui/card';
import { WeatherIcon } from '@/components/WeatherIcon/WeatherIcon';
import { MapPin, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface SwipeableCityCardProps {
  city: CityWeather;
  index: number;
  isSwiped?: boolean;
  onSwipeStart?: (cityId: string) => void;
  onSwipeEnd?: () => void;
}

export default function SwipeableCityCard({ 
  city, 
  index, 
  isSwiped = false, 
  onSwipeStart, 
  onSwipeEnd 
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

  const [deletedCity, setDeletedCity] = useState<CityWeather | null>(null);
  const [showDeleteIcon, setShowDeleteIcon] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const cityName = city.name[locale] || city.name.en;
  const currentTemp = city.current?.temp;
  const weatherCode = city.current?.codeId || 800;
  const weatherIcon = city.current?.icon || '01d';
  const isCurrentLocation = city.id === autoLocationCityId;
  const isActiveCity = index === currentIndex;

  const displayTemp = currentTemp
    ? `${Math.round(currentTemp)}°${unit === 'metric' ? 'C' : 'F'}`
    : '--°';

  // Determine swipe direction based on locale
  const isRTL = locale === 'he';

  // Reset swipe state when isSwiped becomes false (click outside)
  useEffect(() => {
    if (!isSwiped) {
      setDragOffset(0);
      setShowDeleteIcon(false);
    }
  }, [isSwiped]);

  // Handle delete function
  const handleDelete = () => {
    if (isCurrentLocation) {
      showToast({
        message: 'toasts.cannotDeleteCurrentLocation',
        type: 'warning'
      });
      return;
    }

    setDeletedCity(city);
  };

  // Use drag gesture from @use-gesture/react
  const bind = useDrag(
    ({ active, movement: [mx], direction: [xDir], velocity: [vx] }) => {
      // Don't allow drag for current location cities
      if (isCurrentLocation) return;

      // Only allow horizontal swipes in the correct direction
      const correctDirection = isRTL ? xDir > 0 : xDir < 0;
      if (!correctDirection) return;

      // Notify parent when swipe starts
      if (active && Math.abs(mx) > 10 && onSwipeStart) {
        onSwipeStart(city.id);
      }

      setDragOffset(active ? mx : 0);

      // Show delete icon at 50px (half swipe)
      const shouldShowDelete = isRTL ? mx > 50 : mx < -50;
      setShowDeleteIcon(shouldShowDelete);

      if (!active) {
        // Reset on end
        setDragOffset(0);
        setShowDeleteIcon(false);
        
        // Notify parent when swipe ends
        if (onSwipeEnd) {
          onSwipeEnd();
        }

        // Check for full swipe or fast swipe
        const fullSwipeThreshold = 150;
        const fastSwipeThreshold = 0.5;

        const isFullSwipe = Math.abs(mx) > fullSwipeThreshold;
        const isFastSwipe = Math.abs(vx) > fastSwipeThreshold;

        if ((isFullSwipe || isFastSwipe) && correctDirection) {
          handleDelete();
        }
      }
    },
    {
      axis: 'x',
      filterTaps: true,
      bounds: { left: isRTL ? 0 : -200, right: isRTL ? 200 : 0 },
    }
  );

  const handleClick = () => {
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

  // If city is deleted, show undo option
  if (deletedCity) {
    return (
      <motion.div
        initial={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trash2 className="h-5 w-5 text-red-500" />
              <span className="text-red-700 dark:text-red-300 font-medium">
                {t('cities.cityDeleted', { city: cityName })}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleUndo}
                className="text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                {t('common.undo')}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleConfirmDelete}
                className="text-xs"
              >
                {t('common.confirm')}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Delete Icon Background */}
      <motion.div
        className={`absolute inset-y-0 ${isRTL ? 'left-0' : 'right-0'} flex items-center justify-center bg-red-500 rounded-2xl z-0`}
        initial={{ width: 0 }}
        animate={{ width: showDeleteIcon ? 60 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: showDeleteIcon ? 1 : 0, scale: showDeleteIcon ? 1 : 0.5 }}
          transition={{ duration: 0.2 }}
          onClick={handleDelete}
          disabled={!showDeleteIcon}
          className="p-2 rounded-full hover:bg-red-600 transition-colors disabled:pointer-events-none"
          aria-label={t('cities.swipeToDelete')}
        >
          <Trash2 className="h-6 w-6 text-white" />
        </motion.button>
      </motion.div>

      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          x: dragOffset 
        }}
        transition={{ duration: 0.2, delay: index * 0.05 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative z-10"
        style={{ 
          userSelect: 'none', 
          WebkitUserSelect: 'none',
          touchAction: 'pan-x'
        }}
      >
        <div
          {...(isCurrentLocation ? {} : bind())}
          className="w-full"
        >
      <Card
        className={`w-full p-4 cursor-pointer backdrop-blur-md rounded-2xl shadow-sm transition-all duration-200 select-none ${
          isActiveCity
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
        aria-label={`${t('cities.viewWeather')} ${cityName}, ${displayTemp}${isCurrentLocation ? ` - ${t('cities.currentLocation')}` : ''}${isActiveCity ? ` - ${t('cities.nowShowing')}` : ''}`}
        aria-current={isActiveCity ? 'true' : 'false'}
      >
        <div className="flex items-center justify-between gap-3">
          {/* City Name */}
          <div className="flex-1 min-w-0">
            <h3 className={`text-base ${isCurrentLocation ? 'font-bold' : 'font-semibold'} text-neutral-800 dark:text-white/90 flex items-center gap-1.5`}>
              <span className="truncate">{cityName}</span>
              {isCurrentLocation && (
                <span className="inline-flex animate-pulse flex-shrink-0" title={t('cities.currentLocation')}>
                  <MapPin className="h-4 w-4 text-sky-500 dark:text-sky-400" aria-hidden="true" />
                </span>
              )}
            </h3>
            {city.country && (
              <p className="text-xs text-neutral-600 dark:text-white/60 truncate">
                {city.country[locale] || city.country.en}
              </p>
            )}
            {/* Swipe hint for non-current location cities */}
            {!isCurrentLocation && (
              <div className="flex items-center gap-1 mt-1">
                <p className="text-xs text-neutral-500 dark:text-white/40">
                  {t('cities.swipeToDelete')}
                </p>
                <div className="flex gap-0.5">
                  <div className="w-1 h-1 bg-neutral-400 dark:bg-white/60 rounded-full animate-pulse"></div>
                  <div className="w-1 h-1 bg-neutral-400 dark:bg-white/60 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-1 h-1 bg-neutral-400 dark:bg-white/60 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
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
        </div>
      </motion.div>
    </div>
  );
}
