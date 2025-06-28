// src/components/WeatherIcon.tsx

'use client';
import { weatherIconMap } from '@/lib/weatherIconMap';
import Image from 'next/image';

type Properties = {
  code: string;
  alt?: string;
  size?: number;
  priority?: boolean;
  className?: string;
  title?: string;
};

export function WeatherIcon({
  code,
  alt = 'weather icon',
  size = 48,
  priority = true,
  className = '',
  title = '',
}: Properties) {
  const iconSource = weatherIconMap[code] || weatherIconMap.default;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <Image
        src={iconSource}
        width={size}
        height={size}
        alt={alt}
        priority={priority}
        fetchPriority={priority ? 'high' : 'auto'}
        loading={priority ? 'eager' : 'lazy'}
        sizes={`${size}px`}
        unoptimized={iconSource.endsWith('.svg')}
        role="img"
        aria-hidden={!alt}
        aria-label={alt || undefined}
        title={title}
      />
    </div>
  );
}
