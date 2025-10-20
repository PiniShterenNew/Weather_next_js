'use client';

import { weatherIconMapLight, weatherIconMapDark } from '@/lib/weatherIconMap';
import { useWeatherStore } from '@/store/useWeatherStore';
import Image from 'next/image';

type Properties = {
  code?: string | null;
  icon?: string | null;
  alt?: string;
  size?: number;
  priority?: boolean;
  className?: string;
  title?: string;
};

export function WeatherIcon({
  code = null,
  icon = null,
  alt = 'weather icon',
  size = 48,
  priority = true,
  className = '',
  title = '',
}: Properties) {
  const theme = useWeatherStore((s) => s.theme);

  const iconSrc = icon
    ? `/weather-icons/${theme === 'dark' ? 'dark' : 'light'}/${icon}.svg`
    : (theme === 'dark' ? weatherIconMapDark[code || ''] : weatherIconMapLight[code || '']) ||
      (theme === 'dark' ? weatherIconMapDark.default : weatherIconMapLight.default);

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <Image
        src={iconSrc}
        width={size}
        height={size}
        alt={alt}
        priority={priority}
        fetchPriority={priority ? 'high' : 'auto'}
        loading={priority ? 'eager' : 'lazy'}
        sizes={`${size}px`}
        unoptimized={iconSrc.endsWith('.svg')}
        role="img"
        aria-hidden={!alt || alt === 'weather icon'}
        aria-label={alt && alt !== 'weather icon' ? alt : undefined}
        title={title}
      />
    </div>
  );
}
