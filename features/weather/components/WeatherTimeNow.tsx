'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { AppLocale } from '@/types/i18n';
import { useWeatherStore } from '@/store/useWeatherStore';
import { formatTimeWithOffset, isSameTimezone } from '@/lib/helpers';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Globe } from 'lucide-react';
import { WeatherTimeNowProps } from '../types';

function formatFullDate(timestamp: number, locale: string, offsetSec?: number): string {
  const utcDate = new Date(timestamp * 1000);
  if (offsetSec) {
    const cityTime = new Date(utcDate.getTime() + offsetSec * 1000);
    return cityTime.toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }
  return utcDate.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export default function WeatherTimeNow({ 
  timezone, 
  userTimezoneOffset: propUserTimezoneOffset, 
  isSameTimezone: propIsSameTimezone,
  className 
}: WeatherTimeNowProps) {
  const locale = useLocale() as AppLocale;
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const storeUserTimezoneOffset = useWeatherStore(state => state.getUserTimezoneOffset());

  const actualUserTimezoneOffset = propUserTimezoneOffset ?? storeUserTimezoneOffset;
  const actualIsSameTimezone = propIsSameTimezone ?? isSameTimezone(timezone, actualUserTimezoneOffset);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);

  const cityTime = timezone !== undefined && timezone !== null ? formatTimeWithOffset(currentTime, timezone) : '--:--';
  const cityDate = timezone !== undefined && timezone !== null ? formatFullDate(currentTime, locale, timezone) : 'No date';
  const userTime = actualUserTimezoneOffset !== undefined && actualUserTimezoneOffset !== null ? formatTimeWithOffset(currentTime, actualUserTimezoneOffset) : '--:--';
  const userDate = actualUserTimezoneOffset !== undefined && actualUserTimezoneOffset !== null ? formatFullDate(currentTime, locale, actualUserTimezoneOffset) : 'No date';
  const isDifferentTimezone = actualIsSameTimezone === false;

  const [cityHours, cityMinutes] = cityTime.split(':');
  const [userHours, userMinutes] = isDifferentTimezone ? userTime.split(':') : ['', ''];

  return (
    <motion.div 
      className={`mt-3 flex flex-col items-center gap-2 ${className || ''}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
    >
      {/* User Time - Primary (Current timezone - larger and prominent) */}
      <motion.div 
        className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br from-white/20 via-white/10 to-white/5 dark:from-white/10 dark:via-white/5 dark:to-white/3 backdrop-blur-lg px-8 py-4 border border-white/20 dark:border-white/10 hover:scale-105 transition-all duration-300"
        data-testid="user-time"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <div className="flex items-center gap-2.5">
          <Clock className="h-6 w-6 opacity-90 flex-shrink-0 text-brand-500 dark:text-brand-400" />
          <span className="text-sm font-semibold opacity-95 tracking-wide text-gray-900 dark:text-white">{isDifferentTimezone ? userDate : cityDate}</span>
        </div>
        <div className="flex items-baseline gap-1.5" dir="ltr">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isDifferentTimezone ? userHours : cityHours}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="text-4xl font-bold tracking-wider tabular-nums bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text"
            >
              {isDifferentTimezone ? userHours : cityHours}
            </motion.span>
          </AnimatePresence>
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="text-4xl font-bold text-brand-500 dark:text-brand-400"
          >
            :
          </motion.span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isDifferentTimezone ? userMinutes : cityMinutes}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="text-4xl font-bold tracking-wider tabular-nums bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text"
            >
              {isDifferentTimezone ? userMinutes : cityMinutes}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* City Time - Secondary (Only shown when different timezone - smaller) */}
      {isDifferentTimezone && (
        <motion.div 
          className="flex flex-col items-center gap-1 rounded-xl bg-gradient-to-br from-white/10 via-white/5 to-white/3 dark:from-white/5 dark:via-white/3 dark:to-white/2 backdrop-blur-md px-4 py-2 border border-white/10 dark:border-white/5 hover:scale-105 transition-all duration-300 opacity-85 hover:opacity-100"
          data-testid="city-time"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 0.85, scale: 1 }}
          transition={{ duration: 0.2, ease: "easeOut", delay: 0.1 }}
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 opacity-70 flex-shrink-0 text-brand-400 dark:text-brand-300" />
            <span className="text-xs font-medium opacity-80 tracking-wide text-gray-900 dark:text-white">{cityDate}</span>
          </div>
          <div className="flex items-baseline gap-1" dir="ltr">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={cityHours}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="text-lg font-semibold tabular-nums text-gray-900 dark:text-white"
              >
                {cityHours}
              </motion.span>
            </AnimatePresence>
            <motion.span
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="text-lg font-semibold text-brand-400 dark:text-brand-300"
            >
              :
            </motion.span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={cityMinutes}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="text-lg font-semibold tabular-nums text-gray-900 dark:text-white"
              >
                {cityMinutes}
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
