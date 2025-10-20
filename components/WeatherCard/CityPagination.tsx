'use client';

import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { useWeatherStore } from '@/store/useWeatherStore';

export default function CityPagination() {
  const cities = useWeatherStore((s) => s.cities);
  const currentIndex = useWeatherStore((s) => s.currentIndex);
  const setCurrentIndex = useWeatherStore((s) => s.setCurrentIndex);
  const autoLocationCityId = useWeatherStore((s) => s.autoLocationCityId);

  // Don't show pagination if there's only one or no cities
  if (cities.length <= 1) {
    return null;
  }

  return (
    <div 
      className="flex items-center justify-center gap-2 py-2 flex-shrink-0"
      role="navigation"
      aria-label="City navigation"
    >
      {cities.map((city, index) => {
        const isActive = index === currentIndex;
        const isCurrentLocation = city.id === autoLocationCityId;
        
        return (
          <button
            key={city.id}
            onClick={() => setCurrentIndex(index)}
            className="relative focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-full p-1"
            aria-label={`Go to ${city.name[useWeatherStore.getState().locale]}`}
            aria-current={isActive ? 'true' : 'false'}
          >
            {isCurrentLocation ? (
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.2 : 1,
                }}
                transition={{
                  duration: 0.3,
                  ease: 'easeOut',
                }}
              >
                <MapPin
                  className={`transition-colors ${
                    isActive
                      ? 'text-brand-500'
                      : 'text-gray-400 dark:text-white/30'
                  }`}
                  size={isActive ? 16 : 12}
                  fill={isActive ? 'currentColor' : 'none'}
                  strokeWidth={2}
                />
              </motion.div>
            ) : (
              <motion.div
                className={`rounded-full transition-colors ${
                  isActive
                    ? 'bg-brand-500'
                    : 'bg-gray-400 dark:bg-white/30 hover:bg-gray-600 dark:hover:bg-white/50'
                }`}
                initial={false}
                animate={{
                  width: isActive ? 32 : 8,
                  height: 8,
                }}
                transition={{
                  duration: 0.3,
                  ease: 'easeOut',
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

