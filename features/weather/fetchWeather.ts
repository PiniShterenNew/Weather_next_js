// features/weather/fetchWeather.ts
import { CityWeather } from '@/types/weather';
import { cache } from 'react';

export type FetchWeatherInput = {
  id?: string;
  lat: number;
  lon: number;
  unit?: 'metric' | 'imperial';
  name?: {
    en: string;
    he: string;
  };
  country?: {
    en: string;
    he: string;
  };
};

/**
 * Fetches weather data for a specific location
 * Cached using React's cache function for improved performance and Suspense support
 * 
 * @param params - Weather fetch parameters including location coordinates and options
 * @returns Promise with weather data
 */
export const fetchWeather = cache(async ({
  id,
  lat,
  lon,
  unit = 'metric',
  name,
  country
}: FetchWeatherInput): Promise<CityWeather> => {
  try {
    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 second timeout

    const response = await fetch(
      `/api/weather?lat=${lat}&lon=${lon}&unit=${unit}${id ? `&id=${id}` : ''}`,
      {
        // Cache for 30 minutes - weather data doesn't change very frequently
        next: { revalidate: 1800 },
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch weather: ${response.status}`);
    }

    const data = await response.json();
    return { 
      ...data, 
      id: id || data.id,
      // If name and country are provided, use them (for newly added cities)
      ...(name && { name }),
      ...(country && { country })
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Weather fetch timeout');
    }
    throw new Error(`Failed to fetch weather data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});