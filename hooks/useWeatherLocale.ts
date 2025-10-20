import { useLocale } from "next-intl";
import { AppLocale } from "@/types/i18n";
import { CityWeather } from "@/types/weather";

export function useWeatherLocale(cityWeather?: CityWeather) {
  const locale = useLocale() as AppLocale;
  
  const cityLocale = cityWeather?.[locale === 'en' ? 'currentEn' : 'currentHe'];
  
  return {
    locale,
    cityLocale,
    isEnglish: locale === 'en',
  };
}
