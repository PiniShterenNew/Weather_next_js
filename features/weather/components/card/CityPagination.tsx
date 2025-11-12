'use client';

import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

import { useWeatherStore } from '@/store/useWeatherStore';

const CityPagination = () => {
  const cities = useWeatherStore((state) => state.cities);
  const currentIndex = useWeatherStore((state) => state.currentIndex);
  const setCurrentIndex = useWeatherStore((state) => state.setCurrentIndex);
  const autoLocationCityId = useWeatherStore((state) => state.autoLocationCityId);

  if (cities.length <= 1) {
    return null;
  }

  const locale = useWeatherStore.getState().locale;

  return (
    <div className="flex flex-shrink-0 items-center justify-center gap-2 py-1" role="navigation" aria-label="City navigation">
      {cities.map((city, index) => {
        const isActive = index === currentIndex;
        const isCurrentLocation = city.id === autoLocationCityId;

        return (
          <button
            key={`${city.id}-${index}`}
            onClick={() => setCurrentIndex(index)}
            className="relative rounded-full p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label={`Go to ${city.name[locale] || city.name.en}`}
            aria-current={isActive}
          >
            {isCurrentLocation ? (
              <motion.div
                initial={false}
                animate={{ scale: isActive ? 1.2 : 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <MapPin
                  className={isActive ? 'text-brand-500' : 'text-gray-400 dark:text-white/50 transition-colors'}
                  size={isActive ? 16 : 12}
                  fill={isActive ? 'currentColor' : 'none'}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </motion.div>
            ) : (
              <motion.div
                className={`rounded-full transition-colors ${
                  isActive ? 'bg-brand-500' : 'bg-gray-400 hover:bg-gray-600 dark:bg-white/50 dark:hover:bg-white/70'
                }`}
                initial={false}
                animate={{ width: isActive ? 32 : 8, height: 8 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default CityPagination;


