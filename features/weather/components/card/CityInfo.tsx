'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';

import { useWeatherLocale } from '@/hooks/useWeatherLocale';
import { useWeatherStore } from '@/store/useWeatherStore';

import WeatherCardContent from './WeatherCardContent';
import WeatherCardSkeleton from './WeatherCardSkeleton';

const CityInfo = () => {
  const currentIndex = useWeatherStore((state) => state.currentIndex);
  const cities = useWeatherStore((state) => state.cities);
  const cityWeather = cities[currentIndex];

  const { locale, cityLocale } = useWeatherLocale(cityWeather);

  if (!cityWeather || !cityLocale) {
    return <WeatherCardSkeleton />;
  }

  return (
    <Suspense fallback={<WeatherCardSkeleton />} data-testid="city-info">
      <motion.div
        key={cityWeather.id}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="flex h-full w-full flex-col"
        style={{ touchAction: 'manipulation' }}
      >
        <WeatherCardContent cityWeather={cityWeather} cityLocale={cityWeather} locale={locale} />
      </motion.div>
    </Suspense>
  );
};

export default CityInfo;


