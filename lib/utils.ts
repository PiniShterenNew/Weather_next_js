// lib/utils.ts
import { CityTranslation } from '@/types/cache';
import { AppLocale } from '@/types/i18n';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  const c = twMerge(clsx(inputs));
  if (
    typeof c === 'string' &&
    (c.includes('  ') || c.trim() === '' || /[\u00A0]/.test(c)) // רווח כפול, ריק, או non-breaking space
  ) {
    // eslint-disable-next-line no-console
    console.warn('‼️ BAD CLASSNAME:', JSON.stringify(c), JSON.stringify(inputs));
  }
  return c;
}


export function createTranslation(
  primary: string,
  fallback: string,
  lang: AppLocale
): CityTranslation {
  return lang === 'he'
    ? { he: primary, en: fallback }
    : { en: primary, he: fallback };
}

export function getCityId(lat: number, lon: number): string {
  const roundedLat = lat.toFixed(1);
  const roundedLon = lon.toFixed(1);
  return `city:${roundedLat}_${roundedLon}`;
}

export const removeParentheses = (name: string): string => {
  return name.split('(')[0].trim();
};