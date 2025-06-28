import { CityWeather, WeatherCurrent, WeatherForecastItem } from '@/types/weather';
import { CitySuggestion } from '@/types/suggestion';
import { GeoAPIResult, OpenWeatherForecastItem } from '@/types/api';

export function formatTemperature(temporary: number, unit: 'metric' | 'imperial'): string {
  return `${Math.round(temporary)}°${unit === 'metric' ? 'C' : 'F'}`;
}

export function formatWindSpeed(speed: number, unit: 'metric' | 'imperial'): string {
  return unit === 'metric' ? `${speed.toFixed(1)} km/h` : `${(speed * 0.621_371).toFixed(1)} mph`;
}

export function formatPressure(pressure: number): string {
  return `${pressure} hPa`;
}

export function formatVisibility(distance: number): string {
  return distance >= 1000 ? `${(distance / 1000).toFixed(1)} km` : `${distance} m`;
}

/**
 * Check if city timezone matches user's timezone
 * @param cityTz - city timezone offset in seconds
 * @param userTz - user timezone offset (optional)
 * @returns true if timezones are the same
 */
export function isSameTimezone(cityTz: number, userTz: number): boolean {
  return cityTz === userTz;
}

/**
 * Format time for a specific timezone offset - FIXED VERSION
 * @param timestamp - UTC timestamp in seconds
 * @param offset - timezone offset in seconds
 * @returns formatted time string (HH:MM)
 */
export function formatTimeWithOffset(timestampSec: number, offsetSec: number): string {
  // מוסיפים את האופסט כדי לקבל “שעה מקומית” **בתור UTC**
  const date = new Date((timestampSec + offsetSec) * 1000);

  // קוראים ב-UTC כדי לא לקבל כפל אופסט
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Format date for a specific timezone offset
 * @param timestamp - UTC timestamp in seconds
 * @param locale - locale string (e.g., 'he', 'en')
 * @param offsetSec - timezone offset in seconds (optional)
 * @returns formatted date string
 */
export function formatDate(timestamp: number, locale: string, offsetSec?: number): string {
  const utcDate = new Date(timestamp * 1000);

  if (offsetSec) {
    // Calculate city time by adding offset
    const cityTime = new Date(utcDate.getTime() + offsetSec * 1000);

    // Format using UTC methods since we already calculated the local time
    return cityTime.toLocaleDateString(locale, {
      weekday: 'short',
      day: 'numeric',
      timeZone: 'UTC', // Force UTC to prevent double timezone conversion
    });
  }

  // No offset - use user's local time
  return utcDate.toLocaleDateString(locale, { weekday: 'short', day: 'numeric' });
}

export const isCityExists = (cities: CityWeather[], newCity: CityWeather) => {
  return cities.some(
    (city) =>
      city.id === newCity.id || // בדיקה לפי ID
      (city.lat.toFixed(2) === newCity.lat.toFixed(2) && city.lon.toFixed(2) === newCity.lon.toFixed(2)) || // בדיקה לפי קואורדינטות
      (city.name.toLowerCase() === newCity.name.toLowerCase() &&
        city.country.toLowerCase() === newCity.country.toLowerCase()) // בדיקה לפי שם ומדינה
  );
};

/**
 * Convert wind degrees to cardinal direction
 * @param degrees - wind direction in degrees (0-360)
 * @returns cardinal direction string
 */
export function getWindDirection(degrees: number): string {
  const directions = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW',
  ];
  const index = Math.round((degrees %= 360) < 0 ? degrees + 360 : degrees / 22.5) % 16;
  return directions[index];
}

type GetWeatherInput = {
  lat: number;
  lon: number;
  name: string;
  country: string;
  lang: string;
  unit: 'metric' | 'imperial';
};

/**
 * Fetch weather data from OpenWeatherMap API
 * @param params - location and preferences
 * @returns formatted weather data
 */
export async function getWeatherByCoords({
  lat,
  lon,
  name,
  country,
  lang,
  unit,
}: GetWeatherInput): Promise<CityWeather> {
  const API_KEY = process.env.OWM_API_KEY as string;
  const [currentResponse, forecastResponse] = await Promise.all([
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}&lang=${lang}`,
    ),
    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}&lang=${lang}`,
    ),
  ]);

  if (!currentResponse.ok || !forecastResponse.ok) throw new Error('Failed to fetch from OWM');

  const currentJson = await currentResponse.json();
  const forecastJson = await forecastResponse.json();

  const current: WeatherCurrent = {
    temp: currentJson.main.temp,
    feelsLike: currentJson.main.feels_like,
    desc: currentJson.weather[0].description,
    icon: currentJson.weather[0].icon,
    humidity: currentJson.main.humidity,
    wind: currentJson.wind.speed,
    windDeg: currentJson.wind.deg || 0,
    pressure: currentJson.main.pressure,
    visibility: currentJson.visibility,
    clouds: currentJson.clouds.all,
    sunrise: currentJson.sys.sunrise,
    sunset: currentJson.sys.sunset,
    timezone: currentJson.timezone,
  };

  const grouped = groupForecastByDay(forecastJson.list);
  const today = new Date().toISOString().split('T')[0];

  const forecast: WeatherForecastItem[] = grouped
    .filter(([date]) => date > today)
    .slice(0, 5)
    .map(([date, items]) => {
      const temps = items.map((index) => index.main);
      const weatherMidday =
        items.find((index) => index.dt_txt.includes('12:00:00')) || items[Math.floor(items.length / 2)];

      return {
        date: new Date(date).getTime(),
        min: Math.min(...temps.map((t) => t.temp_min)),
        max: Math.max(...temps.map((t) => t.temp_max)),
        icon: weatherMidday.weather[0].icon,
        desc: weatherMidday.weather[0].description,
      } as WeatherForecastItem;
    });

  const cityWeather: CityWeather = {
    id: `${name || currentJson.name}_${country || currentJson.sys.country}`,
    name: name || currentJson.name,
    country: country || currentJson.sys.country,
    lat,
    lon,
    current,
    forecast,
    lastUpdated: Date.now(),
    unit,
    lang,
  };

  return cityWeather;
}

/**
 * Group forecast items by day
 * @param list - forecast items from API
 * @returns array of [date, items] tuples
 */
function groupForecastByDay(
  list: OpenWeatherForecastItem[],
): [string, OpenWeatherForecastItem[]][] {
  const days: Record<string, OpenWeatherForecastItem[]> = {};

  for (const item of list) {
    const dayKey = item?.dt_txt?.split(' ')[0]; // e.g., '2025-06-15'
    if (!days[dayKey]) days[dayKey] = [];
    days[dayKey].push(item);
  }

  return Object.entries(days);
}

/**
 * Get city suggestions from Geoapify API
 * @param query - search query
 * @returns array of city suggestions
 */
export async function getSuggestions(query: string): Promise<CitySuggestion[]> {
  const GEOAPIFY_KEY = process.env.GEOAPIFY_KEY as string;
  const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&limit=5&type=city&lang=he&format=json&apiKey=${GEOAPIFY_KEY}`;
  const response = await fetch(url);

  if (!response.ok) throw new Error('Failed to fetch city suggestions');

  const json = await response.json();

  const suggestions: CitySuggestion[] = json.results.map((item: GeoAPIResult) => ({
    id: `${item.city}_${item.country}`,
    name: item.city,
    country: item.country,
    lat: item.lat,
    lon: item.lon,
    displayName: `${item.city}, ${item.country}`,
    language: 'en',
  }));

  return suggestions;
}

type CityInfo = { name: string; country: string };

/**
 * Reverse-geocode coordinates → { name, country }  (Geoapify)
 * @param lat
 * @param lon
 * @param lang  שני־אותיות, למשל 'he' או 'en'
 */
export async function getCityInfoByCoords(
  lat: number,
  lon: number,
  lang = 'en',
): Promise<CityInfo> {
  const GEOAPIFY_KEY = process.env.GEOAPIFY_KEY as string;
  const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&lang=${lang}&type=city&format=json&apiKey=${GEOAPIFY_KEY}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Geoapify reverse-geocode failed');

  const json = await response.json();
  const hit = json.results?.[0];
  if (!hit?.city || !hit?.country) {
    throw new Error('City not found for coords');
  }

  return {
    name: hit.city, // כבר בשפת ה-lang
    country: hit.country, // שם מדינה מלא (לא קוד ISO)
  };
}
