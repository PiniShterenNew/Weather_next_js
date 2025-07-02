// lib/translateCityName.ts
import { cityNamesCache } from "./cityNamesCache";

export function translateCityName(name: string, locale: 'en' | 'he'): string {
    const translation = cityNamesCache.cities[name];
    return translation?.[locale] || name; // fallback לשם המקורי
}
  
export function translateCountryName(name: string, locale: 'en' | 'he'): string {
    const translation = cityNamesCache.countries[name];
    return translation?.[locale] || name;
}