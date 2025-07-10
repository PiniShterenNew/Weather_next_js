'use client';

import { useWeatherStore } from '@/stores/useWeatherStore';
import { useEffect, useRef } from 'react';
import useIsClient from '@/hooks/useIsClient';
import WeatherListItem from './WeatherListItem';

export default function WeatherList() {
  const isClient = useIsClient();

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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        nextCity();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        prevCity();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextCity, prevCity]);

  if (!isClient) return null;

  return (
    <div className="relative w-full max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-none mx-auto space-y-4 bg" aria-live="polite" data-testid="weather-list">
      <div className="w-full flex flex-col gap-4">
        {cities.map((city, index) => (
          <WeatherListItem
            ref={(el) => { itemRefs.current[index] = el; }}
            key={index}
            cityCurrent={city['currentEn']}
            city={city}
            onClick={() => setCurrentIndex(index)}
            isCurrentIndex={index === currentIndex}
          />
        ))
        }
      </div>
    </div>
  );
}
