/**
 * Weather Feature Types
 * Type definitions for weather-related functionality
 */

import { AppLocale } from '@/types/i18n';

// Weather Data Types
export interface WeatherData {
  id: string;
  lat: number;
  lon: number;
  name: {
    he: string;
    en: string;
  };
  country: {
    he: string;
    en: string;
  };
  currentHe: Record<string, unknown>; // OpenWeather API response in Hebrew
  currentEn: Record<string, unknown>; // OpenWeather API response in English
  lastUpdated: number;
}

// Weather Component Props
export interface WeatherCardProps {
  city: WeatherData;
  locale: AppLocale;
  className?: string;
}

export interface WeatherDetailsProps {
  cityLocale: WeatherData;
  locale: AppLocale;
  className?: string;
}

export interface WeatherTimeNowProps {
  timezone: string | number;
  userTimezoneOffset?: number;
  isSameTimezone?: boolean;
  className?: string;
}

export interface WeatherIconProps {
  icon: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Weather API Types
export interface FetchWeatherInput {
  id: string;
  lat: number;
  lon: number;
  unit: 'metric' | 'imperial';
}

export interface WeatherApiResponse {
  success: boolean;
  data?: WeatherData;
  error?: string;
}

// Weather Store Types
export interface WeatherStoreState {
  cities: WeatherData[];
  isLoading: boolean;
  error: string | null;
}

export interface WeatherStoreActions {
  addCity: (city: WeatherData) => void;
  removeCity: (id: string) => void;
  updateCity: (id: string, city: WeatherData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export type WeatherStore = WeatherStoreState & WeatherStoreActions;
