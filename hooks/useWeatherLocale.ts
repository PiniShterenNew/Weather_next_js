import { useLocale } from 'next-intl';
import { AppLocale } from '@/types/i18n';
import { CityWeather, CityWeatherCurrent } from '@/types/weather';

/**
 * נגזרת פשוטה של נתוני העיר עבור קומפוננטות מזג אוויר.
 * הנחת העבודה: השרת כבר דואג שהשדות החיוניים קיימים.
 */
export function useWeatherLocale(cityWeather?: CityWeather) {
  const locale = useLocale() as AppLocale;

  // המרה מינימלית ל־CityWeatherCurrent בלי בדיקות-יתר
  const cityLocale: CityWeatherCurrent | undefined = cityWeather
    ? {
        current: cityWeather.current,
        forecast: cityWeather.forecast,
        hourly: cityWeather.hourly,
        lastUpdated: cityWeather.lastUpdated,
        unit: cityWeather.unit,
        lat: cityWeather.lat,
        lon: cityWeather.lon,
      }
    : undefined;

  return {
    locale,
    cityLocale,
    isEnglish: locale === 'en',
  };
}
