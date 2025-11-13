/**
 * Server-side weather functions
 * Handles weather data fetching with DB caching
 */

import { PrismaClient } from '@prisma/client';
import { CityWeather, WeatherForecastItem, WeatherHourlyItem, DayPoint, HourPoint } from '@/types/weather';
import { getCityId } from '@/lib/utils';
import { fetchOpenMeteo } from '@/lib/weather/openMeteoClient';
import { getWeatherIcon, getWeatherDescription, getWeatherDescriptionHe } from '@/lib/weather/weatherCodeMap';

const prisma = new PrismaClient();

// TTL constants
const TWENTY_MIN = 20 * 60 * 1000; // Unified TTL for all weather data

/**
 * Get weather data for a city with caching
 * @param cityId - City identifier
 * @param lat - Latitude
 * @param lon - Longitude  
 * @param lang - Language code ('he' or 'en')
 * @returns Weather data
 */
export async function getWeatherCached(
  cityId: string,
  lat: number,
  lon: number,
  lang: 'he' | 'en'
): Promise<CityWeather | null> {
  try {
    // Check cache first
    const cached = await prisma.weatherCache.findUnique({
      where: { cityId }
    });

    const now = Date.now();
    const isFresh = cached && (now - cached.updatedAt.getTime()) < TWENTY_MIN;

    if (isFresh && cached) {
      return cached.payload as unknown as CityWeather;
    }

    // Fetch from Open-Meteo
    const weatherData = await fetchFromOpenMeteo(lat, lon, lang, cityId);
    
    if (!weatherData) {
      // Return cached data if available, even if stale
      return cached ? (cached.payload as unknown as CityWeather) : null;
    }

    // Save to cache
    await prisma.weatherCache.upsert({
      where: { cityId },
      update: { 
        payload: JSON.parse(JSON.stringify(weatherData)),
        updatedAt: new Date()
      },
      create: { 
        cityId, 
        payload: JSON.parse(JSON.stringify(weatherData))
      }
    });

    return weatherData;
  } catch {
    // console.error('Error fetching weather:', error);
    
    // Try to return stale cache as fallback
    try {
      const cached = await prisma.weatherCache.findUnique({
        where: { cityId }
      });
      return cached ? (cached.payload as unknown as CityWeather) : null;
    } catch {
      return null;
    }
  }
}

/**
 * Fetch weather data from Open-Meteo API
 * @param lat - Latitude
 * @param lon - Longitude
 * @param lang - Language code
 * @returns Weather data or null
 */
async function fetchFromOpenMeteo(
  lat: number,
  lon: number,
  lang: 'he' | 'en',
  cityIdFromCaller?: string
): Promise<CityWeather | null> {
  try {
    // Fetch weather data from Open-Meteo
    const weatherBundle = await fetchOpenMeteo(lat, lon);
    
    // Get city data from database for proper bilingual names
    const resolvedCityId = cityIdFromCaller || getCityId(lat, lon);
    const cityData = await prisma.city.findUnique({
      where: { id: resolvedCityId }
    });

    // Build weather object - only weather data, no geographic data
    const weather: CityWeather = {
      id: resolvedCityId,
      lat,
      lon,
      name: cityData ? {
        en: cityData.cityEn,
        he: cityData.cityHe
      } : {
        en: 'Unknown City',
        he: 'עיר לא ידועה'
      },
      country: cityData ? {
        en: cityData.countryEn,
        he: cityData.countryHe
      } : {
        en: 'Unknown',
        he: 'לא ידוע'
      },
      current: {
        codeId: weatherBundle.current.weather_code,
        temp: weatherBundle.current.temp,
        feelsLike: weatherBundle.current.feels_like,
        tempMin: weatherBundle.daily[0]?.min || weatherBundle.current.temp,
        tempMax: weatherBundle.daily[0]?.max || weatherBundle.current.temp,
        desc: lang === 'he' 
          ? getWeatherDescriptionHe(weatherBundle.current.weather_code)
          : getWeatherDescription(weatherBundle.current.weather_code),
        icon: getWeatherIcon(weatherBundle.current.weather_code, weatherBundle.current.is_day),
        humidity: weatherBundle.current.humidity,
        wind: weatherBundle.current.wind_speed,
        windDeg: weatherBundle.current.wind_deg,
        pressure: weatherBundle.current.pressure,
        visibility: weatherBundle.current.visibility,
        clouds: weatherBundle.current.clouds,
        sunrise: weatherBundle.current.sunrise ? new Date(weatherBundle.current.sunrise).getTime() / 1000 : null,
        sunset: weatherBundle.current.sunset ? new Date(weatherBundle.current.sunset).getTime() / 1000 : null,
        timezone: weatherBundle.meta.tz,
        uvIndex: weatherBundle.current.uvi,
        rainProbability: weatherBundle.current.pop
      },
      forecast: processDailyData(weatherBundle.daily),
      hourly: processHourlyData(weatherBundle.hourly, weatherBundle.meta.currentHourIndex, weatherBundle.meta.offsetSec ?? 0),
      lastUpdated: Date.now(),
      unit: 'metric'
    };

    // Debug logging (only in development)
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.debug('🔍 Final Weather Object:', {
        humidity: weather.current.humidity,
        pressure: weather.current.pressure,
        clouds: weather.current.clouds,
        uvIndex: weather.current.uvIndex,
        visibility: weather.current.visibility,
        feelsLike: weather.current.feelsLike
      });
    }

    return weather;
  } catch {
    // console.error('Open-Meteo API error:', error);
    return null;
  }
}

/**
 * Process daily forecast data from Open-Meteo
 */
function processDailyData(dailyData: DayPoint[]): WeatherForecastItem[] {
  return dailyData
    .slice(1, 6) // Skip today, take next 5 days
    .map((day) => ({
      date: new Date(day.date + 'T00:00:00').getTime(),
      min: day.min,
      max: day.max,
      icon: getWeatherIcon(day.weather_code || 0, true), // Assume day for forecast
      desc: getWeatherDescription(day.weather_code || 0),
      codeId: day.weather_code || 0,
      humidity: null, // Not available in daily data
      wind: day.wind_speed_max,
      clouds: null, // Not available in daily data
      sunrise: day.sunrise,
      sunset: day.sunset,
    }));
}

/**
 * Process hourly data from Open-Meteo
 * @param hourlyData - Array of hourly data points
 * @param currentHourIndex - Index of the current hour in the hourly array (0-based)
 * @param offsetSec - UTC offset in seconds for the city's timezone
 * @returns Array of hourly weather items starting from the current hour
 */
function processHourlyData(hourlyData: HourPoint[], currentHourIndex: number = 0, offsetSec: number = 0): WeatherHourlyItem[] {
  // Start from current hour index, take next 24 hours
  const startIndex = Math.max(0, currentHourIndex);
  return hourlyData
    .slice(startIndex, startIndex + 24)
    .map((hour) => {
      // hour.time is in format YYYY-MM-DDTHH:MM (local city time)
      // We must convert it to UTC epoch correctly using the city's offset
      const [datePart, timePart] = hour.time.split('T');
      const [year, month, day] = datePart.split('-').map((v) => parseInt(v, 10));
      const [h, m] = timePart.split(':').map((v) => parseInt(v, 10));
      // Compute UTC epoch: city local time minus offset
      const utcMs = Date.UTC(year, (month || 1) - 1, day || 1, h || 0, m || 0) - (offsetSec || 0) * 1000;

      return {
        time: utcMs,
        temp: hour.temp,
        icon: getWeatherIcon(hour.weather_code || 0, hour.is_day),
        desc: getWeatherDescription(hour.weather_code || 0),
        codeId: hour.weather_code || 0,
        wind: hour.wind_speed,
        humidity: hour.humidity,
      };
    });
}

