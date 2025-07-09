import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Validate the requested locale
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  // Load messages for the locale
  let messages;
  try {
    messages = (await import(`../locales/${locale}.json`)).default;
  } catch {
    // Using default value in case of error
    messages = {};
  }

  return {
    locale,
    messages,
  };
});
