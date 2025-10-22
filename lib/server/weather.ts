/**
 * Server-side weather functions
 * Handles weather data fetching with DB caching
 */

import { PrismaClient } from '@prisma/client';
import { CityWeather, WeatherForecastItem, WeatherHourlyItem } from '@/types/weather';
import { getCityId } from '@/lib/utils';

const prisma = new PrismaClient();

// TTL constants
const FIVE_MIN = 5 * 60 * 1000; // Current weather
// const THIRTY_MIN = 30 * 60 * 1000; // Forecast and hourly - not used yet

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
    const isFresh = cached && (now - cached.updatedAt.getTime()) < FIVE_MIN;

    if (isFresh && cached) {
      return cached.payload as unknown as CityWeather;
    }

    // Fetch from OpenWeatherMap
    const weatherData = await fetchFromOpenWeatherMap(lat, lon, lang);
    
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
 * Fetch weather data from OpenWeatherMap API
 * @param lat - Latitude
 * @param lon - Longitude
 * @param lang - Language code
 * @returns Weather data or null
 */
async function fetchFromOpenWeatherMap(
  lat: number,
  lon: number,
  lang: 'he' | 'en'
): Promise<CityWeather | null> {
  const API_KEY = process.env.OWM_API_KEY;
  if (!API_KEY) {
    throw new Error('OpenWeatherMap API key not configured');
  }

  const baseUrl = 'https://api.openweathermap.org/data/2.5';
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    appid: API_KEY,
    units: 'metric',
    lang: lang
  });

  try {
    // Fetch current weather and forecast in parallel
    const [currentResponse, forecastResponse, oneCallResponse] = await Promise.allSettled([
      fetch(`${baseUrl}/weather?${params}`, { 
        signal: AbortSignal.timeout(5000) // 5s timeout
      }),
      fetch(`${baseUrl}/forecast?${params}`, { 
        signal: AbortSignal.timeout(5000) 
      }),
      fetch(`${baseUrl}/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&exclude=minutely,alerts`, { 
        signal: AbortSignal.timeout(5000) 
      })
    ]);

    // Process current weather
    if (currentResponse.status !== 'fulfilled' || !currentResponse.value.ok) {
      throw new Error('Failed to fetch current weather');
    }
    const currentData = await currentResponse.value.json();

    // Process forecast
    let forecastData = null;
    if (forecastResponse.status === 'fulfilled' && forecastResponse.value.ok) {
      forecastData = await forecastResponse.value.json();
    }

    // Process OneCall (for UV index)
    let oneCallData = null;
    if (oneCallResponse.status === 'fulfilled' && oneCallResponse.value.ok) {
      oneCallData = await oneCallResponse.value.json();
    }

    // Build weather object
    const weather: CityWeather = {
      id: getCityId(lat, lon),
      lat,
      lon,
      name: {
        en: currentData.name,
        he: currentData.name // Will be updated with proper translation
      },
      country: {
        en: currentData.sys.country,
        he: currentData.sys.country // Will be updated with proper translation
      },
      current: {
        codeId: currentData.weather[0].id,
        temp: currentData.main.temp,
        feelsLike: currentData.main.feels_like,
        tempMin: currentData.main.temp_min,
        tempMax: currentData.main.temp_max,
        desc: currentData.weather[0].description,
        icon: currentData.weather[0].icon,
        humidity: currentData.main.humidity,
        wind: currentData.wind.speed,
        windDeg: currentData.wind.deg || 0,
        pressure: currentData.main.pressure,
        visibility: currentData.visibility,
        clouds: currentData.clouds.all,
        sunrise: currentData.sys.sunrise,
        sunset: currentData.sys.sunset,
        timezone: currentData.timezone,
        uvIndex: oneCallData?.current?.uvi,
        rainProbability: forecastData?.list?.[0]?.pop
      },
      forecast: forecastData ? (processForecastData(forecastData) as WeatherForecastItem[]) : [],
      hourly: forecastData ? (processHourlyData(forecastData) as WeatherHourlyItem[]) : [],
      lastUpdated: Date.now(),
      unit: 'metric'
    };

    return weather;
  } catch {
    // console.error('OpenWeatherMap API error:', error);
    return null;
  }
}

/**
 * Process forecast data from API response
 */
function processForecastData(forecastData: unknown): unknown[] {
  const grouped = groupForecastByDay((forecastData as { list: unknown[] }).list);
  const today = new Date().toISOString().split('T')[0];
  
  return grouped
    .filter(([date]) => date > today)
    .slice(0, 5)
    .map(([date, items]) => {
      const temps = items.map((i: unknown) => (i as { main: unknown }).main);
      const weatherMidday = items.find((i: unknown) => (i as { dt_txt: string }).dt_txt.includes('12:00:00')) || items[Math.floor(items.length / 2)];

      return {
        date: new Date(date + 'T00:00:00').getTime(),
        min: Math.min(...temps.map((t: unknown) => (t as { temp_min: number }).temp_min)),
        max: Math.max(...temps.map((t: unknown) => (t as { temp_max: number }).temp_max)),
        icon: (weatherMidday as { weather: Array<{ icon: string }> }).weather[0].icon,
        desc: (weatherMidday as { weather: Array<{ description: string }> }).weather[0].description,
        codeId: (weatherMidday as { weather: Array<{ id: number }> }).weather[0].id,
        humidity: Math.round(items.reduce((sum: number, item: unknown) => sum + (item as { main: { humidity: number } }).main.humidity, 0) / items.length),
        wind: Math.round((items.reduce((sum: number, item: unknown) => sum + (item as { wind: { speed: number } }).wind.speed, 0) / items.length) * 10) / 10,
        clouds: Math.round(items.reduce((sum: number, item: unknown) => sum + (item as { clouds: { all: number } }).clouds.all, 0) / items.length),
      };
    });
}

/**
 * Process hourly data from API response
 */
function processHourlyData(forecastData: unknown): unknown[] {
  return (forecastData as { list: unknown[] }).list
    .slice(0, 8) // Next 8 measurements (24 hours)
    .map((item: unknown) => ({
      time: (item as { dt: number }).dt * 1000,
      temp: (item as { main: { temp: number } }).main.temp,
      icon: (item as { weather: Array<{ icon: string }> }).weather[0].icon,
      desc: (item as { weather: Array<{ description: string }> }).weather[0].description,
      codeId: (item as { weather: Array<{ id: number }> }).weather[0].id,
      wind: (item as { wind: { speed: number } }).wind.speed,
      humidity: (item as { main: { humidity: number } }).main.humidity,
    }));
}

/**
 * Group forecast items by day
 */
function groupForecastByDay(list: unknown[]): [string, unknown[]][] {
  const days: Record<string, unknown[]> = {};

  for (const item of list) {
    const dayKey = (item as { dt_txt?: string })?.dt_txt?.split(' ')[0];
    if (dayKey && !days[dayKey]) days[dayKey] = [];
    if (dayKey) days[dayKey].push(item);
  }

  return Object.entries(days).sort(([a], [b]) => a.localeCompare(b));
}
