'use client';

import { useEffect, useRef } from 'react';

import { useTranslations } from 'next-intl';

import useIsClient from '@/hooks/useIsClient';
import { useRouter } from '@/i18n/navigation';
import { useWeatherStore } from '@/store/useWeatherStore';

import WeatherListItem from './WeatherListItem';

const WeatherList = () => {
  const isClient = useIsClient();
  const router = useRouter();
  const t = useTranslations('cities');

  const cities = useWeatherStore((state) => state.cities);
  const currentIndex = useWeatherStore((state) => state.currentIndex);
  const setCurrentIndex = useWeatherStore((state) => state.setCurrentIndex);
  const nextCity = useWeatherStore((state) => state.nextCity);
  const prevCity = useWeatherStore((state) => state.prevCity);

  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    window.requestAnimationFrame(() => {
      const currentItem = itemRefs.current[currentIndex];
      if (currentItem) {
        currentItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        currentItem.focus();
      }
    });
  }, [currentIndex]);

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
    return null;
  }

  return (
    <div
      className="bg-background_page relative mx-auto h-full w-full overflow-y-auto p-4 lg:max-h-[calc(100vh-6rem)] lg:bg-transparent lg:p-0"
      aria-live="polite"
      data-testid="weather-list"
      role="list"
    >
      <div className="flex w-full flex-col gap-5">
        {cities.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-base text-gray-500 dark:text-gray-400">{t('empty.description')}</p>
          </div>
        ) : (
          cities.map((city, index) => (
            <WeatherListItem
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
              key={city.id}
              cityCurrent={city}
              city={city}
              onClick={() => {
                setCurrentIndex(index);
                router.push('/');
              }}
              isCurrentIndex={index === currentIndex}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default WeatherList;


