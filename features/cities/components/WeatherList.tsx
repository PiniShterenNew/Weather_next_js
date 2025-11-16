'use client';

import { useEffect, useRef } from 'react';

import { useTranslations } from 'next-intl';
import { useVirtualizer } from '@tanstack/react-virtual';

import useIsClient from '@/hooks/useIsClient';
import { useRouter } from '@/i18n/navigation';
import { useWeatherStore } from '@/store/useWeatherStore';

import WeatherListItem from './WeatherListItem';
import WeatherListSkeleton from '@/components/skeleton/WeatherListSkeleton';

const WeatherList = () => {
  const isClient = useIsClient();
  const router = useRouter();
  const t = useTranslations('cities');

  const cities = useWeatherStore((state) => state.cities);
  const currentIndex = useWeatherStore((state) => state.currentIndex);
  const setCurrentIndex = useWeatherStore((state) => state.setCurrentIndex);
  const nextCity = useWeatherStore((state) => state.nextCity);
  const prevCity = useWeatherStore((state) => state.prevCity);
  const isLoading = useWeatherStore((state) => state.isLoading);

  const parentRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const virtualizer = useVirtualizer({
    count: cities.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Estimated height per item
    overscan: 3, // Render 3 extra items above/below viewport
  });

  useEffect(() => {
    if (cities.length > 0 && currentIndex >= 0 && currentIndex < cities.length) {
      virtualizer.scrollToIndex(currentIndex, {
        align: 'center',
        behavior: 'smooth',
      });
    }
  }, [currentIndex, cities.length, virtualizer]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        nextCity();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        prevCity();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextCity, prevCity]);

  if (!isClient) {
    return <WeatherListSkeleton />;
  }

  if (cities.length === 0) {
    return isLoading ? (
      <WeatherListSkeleton />
    ) : (
      <div className="bg-background_page relative mx-auto h-full w-full p-4 lg:bg-transparent">
        <div className="py-12 text-center">
          <p className="text-base text-gray-500 dark:text-gray-400">{t('empty.description')}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="bg-background_page relative mx-auto h-full w-full overflow-y-auto p-4 lg:max-h-[calc(100vh-6rem)] lg:bg-transparent lg:p-0"
      style={{ minHeight: '320px' }}
      aria-live="polite"
      data-testid="weather-list"
      role="list"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const city = cities[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className="mb-5">
                <WeatherListItem
                  ref={(element) => {
                    itemRefs.current[virtualRow.index] = element;
                  }}
                  cityCurrent={city}
                  city={city}
                  onClick={() => {
                    setCurrentIndex(virtualRow.index);
                    router.push('/');
                  }}
                  isCurrentIndex={virtualRow.index === currentIndex}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeatherList;


