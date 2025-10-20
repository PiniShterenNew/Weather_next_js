'use client';

import { useWeatherStore } from '@/store/useWeatherStore';
import { useEffect, useRef } from 'react';
import useIsClient from '@/hooks/useIsClient';
import WeatherListItem from './WeatherListItem';
import { useRouter } from '@/i18n/navigation';

export default function WeatherList() {
  const isClient = useIsClient();
  const router = useRouter();

  const cities = useWeatherStore((s) => s.cities);
  const currentIndex = useWeatherStore((s) => s.currentIndex);
  const setCurrentIndex = useWeatherStore((s) => s.setCurrentIndex);
  const nextCity = useWeatherStore((s) => s.nextCity);
  const prevCity = useWeatherStore((s) => s.prevCity);

  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);


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

  if (!isClient) return null;

  return (
    <div className="relative w-full h-full p-4 lg:p-0 lg:max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent mx-auto bg-background_page lg:bg-transparent" aria-live="polite" data-testid="weather-list">
      <div className="w-full flex flex-col gap-5">
        {cities.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-gray-500 dark:text-gray-400 text-base">
              עדיין לא נוספו ערים. לחץ על ➕ כדי להתחיל.
            </p>
          </div>
        ) : (
          cities.map((city, index) => (
            <WeatherListItem
              ref={(el) => { itemRefs.current[index] = el; }}
              key={city.id}
              cityCurrent={city['currentEn']}
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
}
