'use client';

import { useWeatherStore } from '@/stores/useWeatherStore';
import { useEffect, useRef } from 'react';
import WeatherEmpty from '../WeatherCard/WeatherEmpty';
import useIsClient from '@/hooks/useIsClient';
import WeatherListItem from './WeatherListItem';

export default function WeatherList() {
  const isClient = useIsClient();

  const cities = useWeatherStore((s) => s.cities);
  const currentIndex = useWeatherStore((s) => s.currentIndex);
  const setCurrentIndex = useWeatherStore((s) => s.setCurrentIndex);

  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);


  useEffect(() => {
    const currentItem = itemRefs.current[currentIndex];
    if (currentItem) {
      currentItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentIndex]);

  if (!isClient) return null;
  if (!cities.length) return <WeatherEmpty />;

  return (
    <div className="relative w-full max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-none mx-auto space-y-4 bg" aria-live="polite" data-testid="weather-carousel">
      <div className="w-full flex flex-col gap-4">
        {cities.map((city, index) => (
            <WeatherListItem
              ref={(el) => { itemRefs.current[index] = el; }}
              key={index}
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
