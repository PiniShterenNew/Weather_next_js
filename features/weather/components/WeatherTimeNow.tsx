'use client';

import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Globe } from 'lucide-react';

import { useAppPreferencesStore } from '@/store/useAppPreferencesStore';
import { formatTimeWithOffset, formatTimeWithTimezone, isSameTimezone } from '@/lib/helpers';
import { colors, spacing, borderRadius, shadows, typography, iconSizes } from '@/config/tokens';
import type { AppLocale } from '@/types/i18n';
import type { WeatherTimeNowProps } from '../types';

const containerStyle: CSSProperties = {
  marginTop: spacing[3],
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: spacing[2],
};

const primaryCardStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: spacing[2],
  borderRadius: borderRadius.xl,
  background: colors.background.elevated,
  padding: `${spacing[5]} ${spacing[8]}`,
  border: `1px solid ${colors.border}`,
  boxShadow: shadows.md,
  backdropFilter: 'blur(16px)',
};

const secondaryCardStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: spacing[2],
  borderRadius: borderRadius.lg,
  background: colors.background.card,
  padding: `${spacing[3]} ${spacing[5]}`,
  border: `1px solid ${colors.border}`,
  boxShadow: shadows.sm,
  opacity: 0.9,
};

const labelTextStyle: CSSProperties = {
  fontSize: typography.fontSize.sm,
  fontWeight: Number(typography.fontWeight.semibold),
  color: colors.foreground.primary,
  letterSpacing: '0.04em',
};

const secondaryLabelStyle: CSSProperties = {
  ...labelTextStyle,
  fontSize: typography.fontSize.xs,
};

const timeWrapperStyle = (gap: string): CSSProperties => ({
  display: 'flex',
  alignItems: 'baseline',
  gap,
  direction: 'ltr',
});

const largeTimeStyle: CSSProperties = {
  fontSize: typography.fontSize['4xl'],
  fontWeight: Number(typography.fontWeight.bold),
  color: colors.foreground.primary,
  fontVariantNumeric: 'tabular-nums',
};

const smallTimeStyle: CSSProperties = {
  fontSize: typography.fontSize.lg,
  fontWeight: Number(typography.fontWeight.semibold),
  color: colors.foreground.primary,
  fontVariantNumeric: 'tabular-nums',
};

const iconStylePrimary: CSSProperties = {
  width: iconSizes['2xl'],
  height: iconSizes['2xl'],
  color: colors.weather.sunny,
  flexShrink: 0,
};

const iconStyleSecondary: CSSProperties = {
  width: iconSizes.sm,
  height: iconSizes.sm,
  color: colors.weather.cloudy,
  flexShrink: 0,
};

const colonStyle = (size: 'large' | 'small'): CSSProperties => ({
  fontSize: size === 'large' ? typography.fontSize['4xl'] : typography.fontSize.lg,
  fontWeight: Number(typography.fontWeight.bold),
  color: colors.weather.sunny,
});

function formatFullDate(timestamp: number, locale: string, timezoneOrOffset?: string | number): string {
  const utcDate = new Date(timestamp * 1000);
  
  if (timezoneOrOffset) {
    if (typeof timezoneOrOffset === 'string') {
      return utcDate.toLocaleDateString(locale, {
        timeZone: timezoneOrOffset,
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
    }
    
    const cityTime = new Date(utcDate.getTime() + timezoneOrOffset * 1000);
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
  className,
}: WeatherTimeNowProps) {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const getUserTimezoneOffset = useAppPreferencesStore((state) => state.getUserTimezoneOffset);

  const storeUserTimezoneOffset = getUserTimezoneOffset();
  const actualUserTimezoneOffset = propUserTimezoneOffset ?? storeUserTimezoneOffset;
  const actualIsSameTimezone = propIsSameTimezone ?? isSameTimezone(timezone, actualUserTimezoneOffset);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);

  const fallbackLabel = t('common.notAvailable');

  const cityTime =
    timezone !== undefined && timezone !== null
      ? typeof timezone === 'string' 
        ? formatTimeWithTimezone(currentTime, timezone)
        : formatTimeWithOffset(currentTime, timezone)
      : '--:--';
  const cityDate =
    timezone !== undefined && timezone !== null
      ? typeof timezone === 'string'
        ? formatFullDate(currentTime, locale, timezone)
        : formatFullDate(currentTime, locale, timezone)
      : fallbackLabel;
  const userTime =
    actualUserTimezoneOffset !== undefined && actualUserTimezoneOffset !== null
      ? formatTimeWithOffset(currentTime, actualUserTimezoneOffset)
      : '--:--';
  const userDate =
    actualUserTimezoneOffset !== undefined && actualUserTimezoneOffset !== null
      ? formatFullDate(currentTime, locale, actualUserTimezoneOffset)
      : fallbackLabel;

  const isDifferentTimezone = actualIsSameTimezone === false;

  const [cityHours, cityMinutes] = cityTime.split(':');
  const [userHours, userMinutes] = userTime.split(':');

  const userAriaLabel = useMemo(
    () =>
      isDifferentTimezone
        ? t('aria.userTimePanel', { time: userTime, date: userDate })
        : t('aria.userTimePanel', { time: cityTime, date: cityDate }),
    [cityDate, cityTime, isDifferentTimezone, t, userDate, userTime],
  );

  const cityAriaLabel = useMemo(
    () => t('aria.cityTimePanel', { time: cityTime, date: cityDate }),
    [cityDate, cityTime, t],
  );

  return (
    <motion.div 
      className={className}
      style={containerStyle}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
    >
      <motion.div 
        data-testid="user-time"
        style={primaryCardStyle}
        aria-label={userAriaLabel}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
          <Clock aria-hidden="true" style={iconStylePrimary} />
          <span style={labelTextStyle}>{isDifferentTimezone ? userDate : cityDate}</span>
        </div>
        <div style={timeWrapperStyle(spacing[2])}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isDifferentTimezone ? userHours : cityHours}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              style={largeTimeStyle}
            >
              {isDifferentTimezone ? userHours : cityHours}
            </motion.span>
          </AnimatePresence>
          <motion.span
            aria-hidden="true"
            style={colonStyle('large')}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          >
            :
          </motion.span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isDifferentTimezone ? userMinutes : cityMinutes}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              style={largeTimeStyle}
            >
              {isDifferentTimezone ? userMinutes : cityMinutes}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.div>

      {isDifferentTimezone && (
        <motion.div 
          data-testid="city-time"
          style={secondaryCardStyle}
          aria-label={cityAriaLabel}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 0.9, scale: 1 }}
          transition={{ duration: 0.2, ease: 'easeOut', delay: 0.1 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <Globe aria-hidden="true" style={iconStyleSecondary} />
            <span style={secondaryLabelStyle}>{cityDate}</span>
          </div>
          <div style={timeWrapperStyle(spacing[1])}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={cityHours}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                style={smallTimeStyle}
              >
                {cityHours}
              </motion.span>
            </AnimatePresence>
            <motion.span
              aria-hidden="true"
              style={colonStyle('small')}
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            >
              :
            </motion.span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={cityMinutes}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                style={smallTimeStyle}
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
