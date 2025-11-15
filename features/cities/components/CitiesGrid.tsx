'use client';

import { useTranslations } from 'next-intl';
import { useWeatherStore } from '@/store/useWeatherStore';
import SwipeableCityCard from './SwipeableCityCard';
import { motion } from 'framer-motion';
import { CityWeather } from '@/types/weather';
import { useRef } from 'react';
import WeatherListSkeleton from '@/components/skeleton/WeatherListSkeleton';

interface CitiesGridProps {
  filteredCities?: CityWeather[];
  isSearching?: boolean;
}

export default function CitiesGrid({ filteredCities, isSearching = false }: CitiesGridProps) {
  const t = useTranslations();
  const allCities = useWeatherStore((s) => s.cities);
  const currentIndex = useWeatherStore((s) => s.currentIndex);
  const isLoading = useWeatherStore((s) => s.isLoading);
  const cities = filteredCities !== undefined ? filteredCities : allCities;
  
  const containerRef = useRef<HTMLDivElement>(null);

  // If user is searching, don't show current city first
  // If not searching, show current city first
  const sortedCities = isSearching 
    ? cities 
    : (() => {
        if (cities.length === 0) return cities;
        const currentCity = cities[currentIndex];
        if (!currentCity) return cities;
        
        // Put current city first, then the rest
        const otherCities = cities.filter((_, index) => index !== currentIndex);
        return [currentCity, ...otherCities];
      })();

  if (cities.length === 0) {
    if (isLoading) {
      return <WeatherListSkeleton />;
    }
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="mb-2 text-lg font-medium text-neutral-800 dark:text-white/90">
          {isSearching ? t('search.noResults') : t('empty')}
        </p>
        <p className="text-sm text-neutral-600 dark:text-white/60">
          {isSearching ? t('search.noResultsDesc') : t('emptyDescription')}
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Current city section */}
      {!isSearching && sortedCities.length > 0 && (
        <div>
          <div className="mb-3 w-full">
            <div className="relative w-full">
              <SwipeableCityCard 
                key={sortedCities[0].id} 
                city={sortedCities[0]} 
                index={currentIndex}
              />
            </div>
          </div>
          <div className="w-full h-px bg-neutral-200 dark:bg-white/10 my-4"></div>
        </div>
      )}
      
      {/* All cities grid */}
      <motion.div
        className="grid grid-cols-1 gap-4 select-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ 
          userSelect: 'none', 
          WebkitUserSelect: 'none' 
        }}
      >
        {sortedCities.map((city, displayIndex) => {
          // Skip current city if it's already shown above
          if (!isSearching && displayIndex === 0) return null;
          
          // Find the original index in the cities array
          const originalIndex = cities.findIndex(c => c.id === city.id);
          return (
            <SwipeableCityCard 
              key={city.id} 
              city={city} 
              index={originalIndex}
            />
          );
        })}
      </motion.div>
    </div>
  );
}

