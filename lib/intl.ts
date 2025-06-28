import { AppLocale, Direction } from '@/types/i18n';

export const locales = ['en', 'he'] as const;
export const defaultLocale: AppLocale = 'en';

export function getDirection(locale: AppLocale): Direction {
  return locale === 'he' ? 'rtl' : 'ltr';
}
