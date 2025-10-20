'use client';

import { useWeatherStore } from '@/store/useWeatherStore';
import { Thermometer } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TemperatureUnitToggle() {
  const unit = useWeatherStore((s) => s.unit);
  const setUnit = useWeatherStore((s) => s.setUnit);

  const handleUnitChange = (newUnit: 'metric' | 'imperial') => {
    if (newUnit === unit) return;
    setUnit(newUnit);
  };

  return (
    <div className="flex items-center gap-3 bg-gradient-to-br from-white/95 to-white/80 dark:from-gray-800/95 dark:to-gray-900/80 backdrop-blur-xl border-2 border-sky-200/50 dark:border-sky-800/50 rounded-2xl p-1.5">
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => handleUnitChange('metric')}
        className={`relative h-10 px-5 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
          unit === 'metric'
            ? 'bg-gradient-to-br from-sky-500 to-sky-600 text-white'
            : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5'
        }`}
        aria-label="Celsius"
        aria-pressed={unit === 'metric'}
        dir="ltr"
      >
        {unit === 'metric' && (
          <motion.div
            layoutId="temperature-indicator"
            className="absolute inset-0 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-1.5">
          <Thermometer className="h-4 w-4" />
          °C
        </span>
      </motion.button>
      
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => handleUnitChange('imperial')}
        className={`relative h-10 px-5 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
          unit === 'imperial'
            ? 'bg-gradient-to-br from-sky-500 to-sky-600 text-white'
            : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5'
        }`}
        aria-label="Fahrenheit"
        aria-pressed={unit === 'imperial'}
        dir="ltr"
      >
        {unit === 'imperial' && (
          <motion.div
            layoutId="temperature-indicator"
            className="absolute inset-0 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-1.5">
          <Thermometer className="h-4 w-4" />
          °F
        </span>
      </motion.button>
    </div>
  );
}
