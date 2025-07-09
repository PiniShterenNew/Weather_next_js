import { CityWeather } from "./weather";

/**
 * Bilingual city or country name translation
 */
export interface CityTranslation {
    en: string;
    he: string;
}

/**
 * Full city entry with all fields, used in the client-side application
 * Contains additional fields like continent and timezone for UI display
 */
export interface FullCityEntry {
    id: string;
    lat: number;
    lon: number;
    city: CityTranslation;
    country: CityTranslation;
    continent: string;
    timezoneOffsetSeconds: number;
}

/**
 * Server-side city entry with minimal required fields
 * Used for API responses and database operations
 * Does not include UI-specific fields like continent or timezone
 */
export interface FullCityEntryServer {
    id: string;
    lat: number;
    lon: number;
    city: CityTranslation;
    country: CityTranslation;
}

/**
 * Database representation of a city
 * Maps to the Prisma City model schema
 */
export interface FullCityEntryDB {
    id: string;
    lat: number;
    lon: number;
    cityEn: string;
    cityHe: string;
    countryEn: string;
    countryHe: string;
}

/**
 * Single entry in the weather cache
 */
export interface WeatherCacheEntry {
    data: CityWeather;
    timestamp: number;
}

/**
 * In-memory weather cache store
 * Maps city IDs to their cached weather data
 */
export type WeatherCacheStore = Record<string, WeatherCacheEntry>;