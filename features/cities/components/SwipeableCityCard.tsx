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
import { WeatherIcon } from '@/components/WeatherIcon/WeatherIcon';
import { MapPin, Trash2, RotateCcw, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchSecure } from '@/lib/fetchSecure';

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
  const updateCurrentLocation = useWeatherStore((s) => s.updateCurrentLocation);
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);

  const [deletedCity, setDeletedCity] = useState<CityWeather | null>(null);
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
    
    if (!navigator.geolocation) {
      showToast({
        message: 'toasts.geolocationNotSupported',
        type: 'error'
      });
      return;
    }

    setIsRefreshingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Call reverse geocoding API to get city
          const response = await fetchSecure(`/api/reverse?lat=${latitude}&lon=${longitude}`, { requireAuth: true });
          if (!response.ok) {
            throw new Error('Failed to get location');
          }
          
          const data = await response.json();
          
          if (data.id) {
            updateCurrentLocation(latitude, longitude, data.id);
            const cityName = data.cityHe || data.cityEn || 'Unknown';
            showToast({
              message: 'toasts.locationUpdated',
              type: 'success',
              values: { city: cityName }
            });
            
            // Refresh the page to load the new location data
            router.refresh();
          }
        } catch {
          showToast({
            message: 'toasts.locationUpdateFailed',
            type: 'error'
          });
        } finally {
          setIsRefreshingLocation(false);
        }
      },
      () => {
        showToast({
          message: 'toasts.locationAccessDenied',
          type: 'error'
        });
        setIsRefreshingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
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
            
          </div>

          {/* Weather Icon & Temp & Delete Button */}
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
            
            {/* Location Refresh Button - Only for current location */}
            {isCurrentLocation && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRefreshLocation}
                disabled={isRefreshingLocation}
                className="h-8 w-8 aspect-square rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 flex items-center justify-center p-0"
                title={t('cities.refreshLocation')}
                aria-label={t('cities.refreshLocation')}
              >
                {isRefreshingLocation ? (
                  <RotateCcw className="h-3 w-3 animate-spin" />
                ) : (
                  <Navigation className="h-3 w-3" />
                )}
              </Button>
            )}
            
            {/* Delete Button - Show for all cities including current location */}
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                hapticButtonPress();
                handleDelete();
              }}
              className="h-8 w-8 aspect-square rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 flex items-center justify-center p-0"
              title={t('cities.deleteCity')}
              aria-label={t('cities.deleteCity')}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
