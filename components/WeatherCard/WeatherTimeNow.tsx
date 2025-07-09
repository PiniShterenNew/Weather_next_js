'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { AppLocale } from '@/types/i18n';
import { useWeatherStore } from '@/stores/useWeatherStore';
import { formatTimeWithOffset, isSameTimezone } from '@/lib/helpers';
import { motion, AnimatePresence } from 'framer-motion';

type Properties = {
  timezone: number;
};

function formatFullDate(timestamp: number, locale: string, offsetSec?: number): string {
  const utcDate = new Date(timestamp * 1000);
  if (offsetSec) {
    const cityTime = new Date(utcDate.getTime() + offsetSec * 1000);
    return cityTime.toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: 'UTC',
    });
  }
  return utcDate.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export default function WeatherTimeNow({ timezone }: Properties) {
  const locale = useLocale() as AppLocale;
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const userTimezoneOffset = useWeatherStore(state => state.getUserTimezoneOffset());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);

  const cityTime = formatTimeWithOffset(currentTime, timezone);
  const cityDate = formatFullDate(currentTime, locale, timezone);
  const userTime = formatTimeWithOffset(currentTime, userTimezoneOffset);
  const userDate = formatFullDate(currentTime, locale, userTimezoneOffset);
  const isDifferentTimezone = !isSameTimezone(timezone, userTimezoneOffset);

  const [cityHours, cityMinutes] = cityTime.split(':');
  const [userHours, userMinutes] = isDifferentTimezone ? userTime.split(':') : ['', ''];

  return (
    <div className="flex flex-col items-start space-y-1">
      <div className="flex flex-row items-start" data-testid="city-time">
        <div className="text-start">
          <p className="text-sm font-normal opacity-90">{cityDate}</p>
        </div>
        <p className="text-xs font-semibold opacity-90 mx-1">|</p>
        <div className="flex items-center gap-2">
          <div className="flex text-sm items-baseline rtl:flex-row-reverse">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={cityHours}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="tracking-wider"
              >
                {cityHours}
              </motion.span>
            </AnimatePresence>
            <motion.span
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              :
            </motion.span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={cityMinutes}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="tracking-wider"
              >
                {cityMinutes}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {isDifferentTimezone && (
        <div className="flex flex-row items-start">
          <p className="text-xs font-normal opacity-90">{`(${userDate}`}</p>
          <p className="text-xs font-semibold opacity-90 mx-1">|</p>
          <div className="flex text-xs font-light items-center gap-1 rtl:flex-row-reverse">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={userHours}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {`${userHours})`}
                </motion.span>
              </AnimatePresence>
              <motion.span
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                :
              </motion.span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={userMinutes}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {userMinutes}
                </motion.span>
              </AnimatePresence>
            </div>
        </div>
      )}
      {/* <div className="" data-testid="last-updated">
        <p className="text-xs leading-[0.2rem] text-black/60 dark:text-white/60">
          {t('lastUpdated')} - {formatTimeWithOffset(lastUpdated / 1000, userTimezoneOffset)}
        </p>
      </div> */}
    </div>
  );
}