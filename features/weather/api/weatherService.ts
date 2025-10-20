/**
 * Weather API Service
 * Handles weather data fetching with validation
 */

import { z } from 'zod';
import { WeatherData, FetchWeatherInput, WeatherApiResponse } from '../types';

// Zod schemas for validation
const WeatherDataSchema = z.object({
  id: z.string(),
  lat: z.number(),
  lon: z.number(),
  name: z.object({
    he: z.string(),
    en: z.string(),
  }),
  country: z.object({
    he: z.string(),
    en: z.string(),
  }),
  currentHe: z.any(),
  currentEn: z.any(),
  lastUpdated: z.number(),
}).passthrough();

const FetchWeatherInputSchema = z.object({
  id: z.string(),
  lat: z.number(),
  lon: z.number(),
  unit: z.enum(['metric', 'imperial']),
});

// Weather API service class
export class WeatherService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch weather data for a specific city
   */
  async fetchWeather(input: FetchWeatherInput): Promise<WeatherApiResponse> {
    try {
      // Validate input
      const validatedInput = FetchWeatherInputSchema.parse(input);

      const params = new URLSearchParams({
        id: validatedInput.id,
        lat: validatedInput.lat.toString(),
        lon: validatedInput.lon.toString(),
        unit: validatedInput.unit,
      });

      const response = await fetch(`${this.baseUrl}/weather?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      
      // Validate response data
      const validatedData = WeatherDataSchema.parse(data) as WeatherData;

      return {
        success: true,
        data: validatedData,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: `Validation error: ${error.errors.map(e => e.message).join(', ')}`,
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Fetch weather data for multiple cities
   */
  async fetchMultipleWeather(inputs: FetchWeatherInput[]): Promise<WeatherApiResponse[]> {
    const promises = inputs.map(input => this.fetchWeather(input));
    return Promise.all(promises);
  }

  /**
   * Validate weather data
   */
  validateWeatherData(data: unknown): data is WeatherData {
    try {
      WeatherDataSchema.parse(data);
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const weatherService = new WeatherService();
