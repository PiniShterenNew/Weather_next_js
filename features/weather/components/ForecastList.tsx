'use client';

import type { CSSProperties } from 'react';
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Droplets, Sunrise, Sunset, Wind } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { WeatherIcon } from '@/features/weather/components/WeatherIcon';
import { colors, spacing, borderRadius, shadows, typography, iconSizes } from '@/config/tokens';
import { formatDate, formatTemperatureWithConversion } from '@/lib/helpers';
import type { AppLocale } from '@/types/i18n';
import type { WeatherForecastItem } from '@/types/weather';
import type { TemporaryUnit } from '@/types/ui';

export interface ForecastListProps {
  forecast: WeatherForecastItem[];
  cityUnit: TemporaryUnit;
  unit: TemporaryUnit;
}

const containerStyle: CSSProperties = {
  borderRadius: borderRadius.xl,
  border: `1px solid ${colors.border}`,
  background: colors.background.elevated,
  padding: spacing[4],
  boxShadow: shadows.sm,
};

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: spacing[2],
  marginBottom: spacing[3],
  fontSize: typography.fontSize.lg,
  fontWeight: Number(typography.fontWeight.semibold),
  color: colors.foreground.primary,
};

const dividerStyle: CSSProperties = {
  width: iconSizes.xs,
  height: iconSizes['2xl'],
  borderRadius: borderRadius.full,
  background: colors.border,
};

const listStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: spacing[0],
};

const itemWrapperStyle: CSSProperties = {
  width: '100%',
};

const cardStyle: CSSProperties = {
  borderRadius: borderRadius.xl,
  border: `1px solid ${colors.border}`,
  background: colors.background.card,
  padding: spacing[4],
  boxShadow: shadows.sm,
  backdropFilter: 'blur(12px)',
};

const cardHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: spacing[3],
  gap: spacing[4],
};

const dateStyle: CSSProperties = {
  minWidth: '82px',
  fontSize: typography.fontSize.sm,
  fontWeight: Number(typography.fontWeight.semibold),
  color: colors.foreground.primary,
};

const temperatureHighStyle = (highlight: boolean): CSSProperties => ({
  fontSize: typography.fontSize['2xl'],
  fontWeight: Number(typography.fontWeight.bold),
  color: highlight ? colors.weather.hot : colors.foreground.primary,
  fontVariantNumeric: 'tabular-nums',
});

const temperatureLowStyle = (highlight: boolean): CSSProperties => ({
  fontSize: typography.fontSize.base,
  fontWeight: Number(typography.fontWeight.medium),
  color: highlight ? colors.weather.cold : colors.foreground.muted,
  fontVariantNumeric: 'tabular-nums',
});

const metricRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: spacing[3],
  fontSize: typography.fontSize.xs,
  color: colors.foreground.muted,
};

const metricStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: spacing[1],
};

const metricIconStyle: CSSProperties = {
  width: iconSizes.sm,
  height: iconSizes.sm,
  color: colors.foreground.muted,
};

const separatorLine: CSSProperties = {
  margin: `${spacing[3]} 0`,
  height: '1px',
  background: colors.border,
};

interface ForecastItemProps {
  day: WeatherForecastItem;
  index: number;
  cityUnit: TemporaryUnit;
  unit: TemporaryUnit;
  locale: AppLocale;
  timeFormatter: Intl.DateTimeFormat;
  weatherIconPixelSize: number;
  windUnit: string;
  percentageUnit: string;
  t: (key: string, values?: Record<string, string>) => string;
}

const ForecastItem = React.memo(({
  day,
  index,
  cityUnit,
  unit,
  locale,
  timeFormatter,
  weatherIconPixelSize,
  windUnit,
  percentageUnit,
  t,
}: ForecastItemProps) => {
  const maxValue = formatTemperatureWithConversion(day.max, cityUnit, unit);
  const minValue = formatTemperatureWithConversion(day.min, cityUnit, unit);

  const tempDiff = day.max - day.min;
  const isWarming = tempDiff > 10;
  const isCooling = tempDiff < 5;

  const dateLabel = formatDate(day.date / 1000, locale);
  const ariaLabel = t('aria.forecastItem', {
    date: dateLabel,
    high: maxValue,
    low: minValue,
  });

  const sunriseTime = day.sunrise ? timeFormatter.format(new Date(day.sunrise)) : null;
  const sunsetTime = day.sunset ? timeFormatter.format(new Date(day.sunset)) : null;

  return (
    <React.Fragment>
      {index > 0 ? <div style={separatorLine} aria-hidden="true" /> : null}
      <motion.div
        data-testid="forecast-item"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        style={itemWrapperStyle}
        role="listitem"
        aria-label={ariaLabel}
      >
        <div style={cardStyle} className="hover-lift">
          <div style={cardHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], flex: 1 }}>
              <p style={dateStyle} data-testid="forecast-date">
                {dateLabel}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                <WeatherIcon
                  code={null}
                  icon={day.icon}
                  alt={day.desc}
                  size={Number.isNaN(weatherIconPixelSize) ? 48 : weatherIconPixelSize}
                  title={day.desc}
                  priority={index < 3}
                />
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: locale === 'he' ? 'row-reverse' : 'row',
                alignItems: 'center',
                gap: spacing[4],
              }}
            >
              <div style={temperatureHighStyle(isWarming)} data-testid="forecast-max">
                {maxValue}
              </div>
              <div style={temperatureLowStyle(isCooling)} data-testid="forecast-min">
                {minValue}
              </div>
            </div>
          </div>

          {day.wind !== undefined ||
          day.humidity !== undefined ||
          day.clouds !== undefined ||
          sunriseTime ||
          sunsetTime ? (
            <div style={metricRowStyle}>
              {day.wind !== undefined ? (
                <div style={metricStyle}>
                  <Wind aria-hidden="true" style={metricIconStyle} />
                  <span>
                    {day.wind} {windUnit}
                  </span>
                </div>
              ) : null}
              {day.humidity !== undefined ? (
                <div style={metricStyle}>
                  <Droplets aria-hidden="true" style={metricIconStyle} />
                  <span>
                    {day.humidity}
                    {percentageUnit}
                  </span>
                </div>
              ) : null}
              {day.clouds !== undefined ? (
                <div style={metricStyle}>
                  <Cloud aria-hidden="true" style={metricIconStyle} />
                  <span>
                    {day.clouds}
                    {percentageUnit}
                  </span>
                </div>
              ) : null}
              {sunriseTime ? (
                <div style={metricStyle}>
                  <Sunrise aria-hidden="true" style={metricIconStyle} />
                  <span>{sunriseTime}</span>
                </div>
              ) : null}
              {sunsetTime ? (
                <div style={metricStyle}>
                  <Sunset aria-hidden="true" style={metricIconStyle} />
                  <span>{sunsetTime}</span>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </motion.div>
    </React.Fragment>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.day.date === nextProps.day.date &&
    prevProps.day.max === nextProps.day.max &&
    prevProps.day.min === nextProps.day.min &&
    prevProps.day.icon === nextProps.day.icon &&
    prevProps.day.desc === nextProps.day.desc &&
    prevProps.cityUnit === nextProps.cityUnit &&
    prevProps.unit === nextProps.unit
  );
});

ForecastItem.displayName = 'ForecastItem';

const ForecastList = ({ forecast, cityUnit, unit }: ForecastListProps) => {
  const locale = useLocale() as AppLocale;
  const t = useTranslations();

  const windUnit =
    unit === 'metric' ? t('units.windSpeed.metric') : t('units.windSpeed.imperial');

  const percentageUnit = t('units.percentageSymbol');

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === 'he' ? 'he-IL' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    [locale],
  );
  const weatherIconPixelSize = Number.parseFloat(iconSizes['3xl']) * 16;

  return (
    <div
      className="animate-fade-in"
      data-testid="forecast-list"
      style={containerStyle}
      role="region"
      aria-label={t('aria.forecastList')}
    >
      <h3 style={headerStyle} data-testid="forecast-title">
        <div style={dividerStyle} aria-hidden="true" />
        {t('forecast.title')}
      </h3>
      <div style={listStyle} role="list">
        {forecast.map((day, index) => (
          <ForecastItem
            key={`${day.date}-${index}`}
            day={day}
            index={index}
            cityUnit={cityUnit}
            unit={unit}
            locale={locale}
            timeFormatter={timeFormatter}
            weatherIconPixelSize={weatherIconPixelSize}
            windUnit={windUnit}
            percentageUnit={percentageUnit}
            t={t}
          />
        ))}
      </div>
    </div>
  );
};

export default ForecastList;
