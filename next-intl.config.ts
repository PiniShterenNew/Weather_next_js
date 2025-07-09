// Simplest configuration according to next-intl documentation
export const locales = ['en', 'he'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale = 'en';

// Configuration for return-to-simple support
const config = {
  defaultLocale: 'en',
  locales: ['en', 'he'],
};

export default config;
