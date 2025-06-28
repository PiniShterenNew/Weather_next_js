'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { formatTimeWithOffset, isSameTimezone } from '@/lib/helpers';
import { AppLocale } from '@/types/i18n';
import { useWeatherStore } from '@/stores/useWeatherStore';

type Properties = {
  timezone: number;
  lastUpdated: number;
};

/**
 * Format full date with day of week, day and month - FIXED VERSION
 * @param timestamp - UTC timestamp in seconds
 * @param locale - locale string
 * @param offsetSec - timezone offset in seconds
 * @returns formatted date string
 */
function formatFullDate(timestamp: number, locale: string, offsetSec?: number): string {
  const utcDate = new Date(timestamp * 1000);

  if (offsetSec) {
    // Calculate city time by adding offset
    const cityTime = new Date(utcDate.getTime() + offsetSec * 1000);

    // Use UTC methods to format the date since we already calculated the local time
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: 'UTC', // Force UTC to prevent double timezone conversion
    };

    return cityTime.toLocaleDateString(locale, options);
  }

  // No offset - use user's local time
  return utcDate.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export default function WeatherTimeNow({ timezone, lastUpdated }: Properties) {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  // השגת אזור הזמן של המשתמש מ-Store במקום מ-new Date()
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
    <div className="flex flex-col items-center space-y-3">
      {/* Main city time display */}
      <div className="flex flex-col items-center space-y-2" data-testid="city-time">
        {/* Time with blinking colon */}
        <div className="flex items-center gap-1 relative">
          <Clock className="h-5 w-5 opacity-60 absolute right-[-30%]" role="presentation" />
          <div className="flex items-baseline rtl:flex-row-reverse gap-1">
            <span className="text-3xl font-mono font-bold tracking-wider">{cityHours}</span>
            <span
              className={`text-3xl font-mono font-bold transition-opacity duration-500 ${Math.floor(currentTime) % 2 === 0 ? 'opacity-100' : 'opacity-20'
                }`}
            >
              :
            </span>
            <span className="text-3xl font-mono font-bold tracking-wider">{cityMinutes}</span>
          </div>
        </div>

        {/* City date */}
        <div className="text-center">
          <p className="text-lg font-medium opacity-90">{cityDate}</p>
        </div>
      </div>

      {/* User time (if different timezone) */}
      {isDifferentTimezone && (
        <div className="mt-3 px-4 py-2 bg-muted/40 rounded-xl border border-muted/60" data-testid="user-time">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1 rtl:flex-row-reverse">
              <span className="font-mono font-semibold flex">{userHours}</span>
              <span
                className={`font-mono font-semibold transition-opacity duration-500 ${Math.floor(currentTime) % 2 === 0 ? 'opacity-100' : 'opacity-30'
                  }`}
              >
                :
              </span>
              <span className="font-mono font-semibold">{userMinutes}</span>
            </div>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{userDate}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground font-medium">{t('yourTime')}</span>
          </div>
        </div>
      )}
      <div className="mt-3 px-4" data-testid="last-updated">
        <p className="text-sm opacity-90">
          {t('lastUpdated')} - {formatTimeWithOffset(lastUpdated, userTimezoneOffset)}
        </p>
      </div>
    </div>
  );
}
