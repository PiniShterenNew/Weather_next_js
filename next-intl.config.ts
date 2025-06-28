// התצורה הפשוטה ביותר לפי התיעוד של next-intl
export const locales = ['en', 'he'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale = 'en';

// הגדרה של תמיכה ברטרן-לסימפל
const config = {
  defaultLocale: 'en',
  locales: ['en', 'he'],
};

export default config;
