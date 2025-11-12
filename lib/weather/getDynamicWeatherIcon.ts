import { getWeatherIcon } from './weatherCodeMap';
import { isNightTime } from '@/lib/helpers';
import type { CityWeather } from '@/types/weather';

/**
 * Get weather icon dynamically based on current time in the city's timezone
 * This ensures the icon reflects day/night correctly even if data was fetched at a different time
 * 
 * @param city - City weather data
 * @returns Weather icon string (e.g., '01d' or '01n')
 */
export function getDynamicWeatherIcon(city: CityWeather): string {
  const weatherCode = city.current?.codeId || 0;
  const sunrise = city.current?.sunrise;
  const sunset = city.current?.sunset;
  const timezone = city.current?.timezone;

  // If we have sunrise/sunset, calculate if it's night based on current time in city's timezone
  if (sunrise !== null && sunrise !== undefined && sunset !== null && sunset !== undefined && timezone) {
    try {
      // Get current time in city's timezone
      const now = new Date();
      const cityTimeString = now.toLocaleString('en-US', {
        timeZone: timezone,
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      // Parse city time
      const [datePart, timePart] = cityTimeString.split(', ');
      const [month, day, year] = datePart.split('/');
      const [hour, minute, second] = timePart.split(':');
      
      // Create date object in city timezone
      const cityDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second)
      );

      // Convert to UTC timestamp in seconds
      const cityTimeSeconds = Math.floor(cityDate.getTime() / 1000);

      // Check if it's night
      const isNight = isNightTime(cityTimeSeconds, sunrise, sunset);
      
      return getWeatherIcon(weatherCode, !isNight);
    } catch (error) {
      // Fallback to stored icon if calculation fails
      console.error('Failed to calculate dynamic icon:', error);
      return city.current?.icon || getWeatherIcon(weatherCode, true);
    }
  }

  // Fallback to stored icon if we don't have sunrise/sunset/timezone
  return city.current?.icon || getWeatherIcon(weatherCode, true);
}

