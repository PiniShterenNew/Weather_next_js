import { BilingualName, CityWeather, CityWeatherCurrent, WeatherCurrent, WeatherForecastItem } from '@/types/weather';
import { GeoAPIResult, OpenWeatherForecastItem } from '@/types/api';
import { TemporaryUnit } from '@/types/ui';
import { getCityId } from './utils';
import { CityTranslation } from '@/types/cache';

export function formatTemperatureWithConversion(
  value: number,
  fromUnit: TemporaryUnit,
  toUnit: TemporaryUnit
): string {
  let converted = value;

  if (fromUnit !== toUnit) {
    // Convert between °C and °F
    converted =
      toUnit === 'metric'
        ? ((value - 32) * 5) / 9       // F → C
        : (value * 9) / 5 + 32;        // C → F
  }

  return `${Math.round(converted)}°${toUnit === 'metric' ? 'C' : 'F'}`;
}

export function formatWindSpeed(speed: number, unit: TemporaryUnit): string {
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
export function formatTimeWithOffset(timestamp: number, offsetSeconds: number): string {
  const date = new Date(timestamp * 1000 + offsetSeconds * 1000);

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

/**
 * Checks if a city already exists in the cities array
 * @param cities - Array of existing city weather data
 * @param newCity - New city to check for existence
 * @returns True if the city exists in the array, false otherwise
 */
export const isCityExists = (cities: CityWeather[], newCity: CityWeather) => {
  return cities.some(
    (city) =>
      city.id === newCity.id || // Check by ID
      (city.lat.toFixed(2) === newCity.lat.toFixed(2) && city.lon.toFixed(2) === newCity.lon.toFixed(2)) || // Check by coordinates
      (city.name.en === newCity.name.en &&
        city.country.en === newCity.country.en) // Check by name and country
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
  name: string | BilingualName;
  country: string | BilingualName;
};

export async function getWeatherByCoords(
  input: Omit<GetWeatherInput, 'lang'>
): Promise<{ he: CityWeatherCurrent; en: CityWeatherCurrent }> {
  const API_KEY = process.env.OWM_API_KEY as string;

  const urls = {
    he: {
      current: `https://api.openweathermap.org/data/2.5/weather?lat=${input.lat}&lon=${input.lon}&appid=${API_KEY}&units=metric&lang=he`,
      forecast: `https://api.openweathermap.org/data/2.5/forecast?lat=${input.lat}&lon=${input.lon}&appid=${API_KEY}&units=metric&lang=he`
    },
    en: {
      current: `https://api.openweathermap.org/data/2.5/weather?lat=${input.lat}&lon=${input.lon}&appid=${API_KEY}&units=metric&lang=en`,
      forecast: `https://api.openweathermap.org/data/2.5/forecast?lat=${input.lat}&lon=${input.lon}&appid=${API_KEY}&units=metric&lang=en`
    }
  };

  const fetchWeatherData = async (lang: 'he' | 'en'): Promise<CityWeatherCurrent> => {
    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(urls[lang].current),
      fetch(urls[lang].forecast),
    ]);

    if (!currentResponse.ok || !forecastResponse.ok) {
      throw new Error(`Failed to fetch weather for lang: ${lang}`);
    }

    const currentJson = await currentResponse.json();
    const forecastJson = await forecastResponse.json();

    const current: WeatherCurrent = {
      codeId: currentJson.weather[0].id,
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
        const temps = items.map((i) => i.main);
        const weatherMidday =
          items.find((i) => i.dt_txt.includes('12:00:00')) || items[Math.floor(items.length / 2)];

        return {
          date: new Date(date).getTime(),
          min: Math.min(...temps.map((t) => t.temp_min)),
          max: Math.max(...temps.map((t) => t.temp_max)),
          icon: weatherMidday.weather[0].icon,
          desc: weatherMidday.weather[0].description,
          codeId: weatherMidday.weather[0].id,
        };
      });

    return {
      current,
      forecast,
      lastUpdated: Date.now(),
      unit: 'metric',
      lat: input.lat,
      lon: input.lon,
    };
  };

  const [he, en] = await Promise.all([
    fetchWeatherData('he'),
    fetchWeatherData('en')
  ]);

  return { he, en };
}


/**
 * Group forecast items by day
 * @param list - forecast items from API
 * @returns array of [date, items] tuples
 */
export function groupForecastByDay(
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

const GEOAPIFY_KEY = process.env.GEOAPIFY_KEY as string;

async function fetchGeoapify(query: string, lang: 'he' | 'en') {
  const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&limit=5&type=city&lang=${lang}&format=json&apiKey=${GEOAPIFY_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geoapify error (${lang})`);

  const results = (await res.json()).results as GeoAPIResult[];

  const allowedTypes = ['city', 'town', 'village', 'locality', 'district'];

  return results.filter((item) => allowedTypes.includes(item.result_type || ''));
}

export async function getSuggestionsForDB(query: string, lang: 'he' | 'en') {
  const primaryResults = await fetchGeoapify(query, lang);
  const fallbackLang = lang === 'he' ? 'en' : 'he';

  const cityMap = new Map<string, {
    id: string;
    lat: number;
    lon: number;
    city: CityTranslation;
    country: CityTranslation;
  }>();

  for (const item of primaryResults) {
    const id = getCityId(item.lat, item.lon);
    const cityName = item.address_line1 || item.city || '';
    const countryName = item.country || '';

    if (!cityMap.has(id)) {
      cityMap.set(id, {
        id,
        lat: item.lat,
        lon: item.lon,
        city: { en: '', he: '' },
        country: { en: '', he: '' },
      });
    }

    const entry = cityMap.get(id)!;
    if (lang === 'he') {
      entry.city.he = cityName;
      entry.country.he = countryName;
    } else {
      entry.city.en = cityName;
      entry.country.en = countryName;
    }

    const fallback = await getCityInfoByCoords(item.lat, item.lon, fallbackLang);
    if (fallbackLang === 'he') {
      entry.city.he = fallback.name;
      entry.country.he = fallback.country;
    } else {
        entry.city.en = fallback.name;
        entry.country.en = fallback.country;
      }
  }

  return Array.from(cityMap.values());
}

export const getLocationForDB = async (lat: number, lon: number) => {
  const enInfo = await getCityInfoByCoords(lat, lon, 'en');
  const heInfo = await getCityInfoByCoords(lat, lon, 'he');

  return {
    id: getCityId(lat, lon),
    lat,
    lon,
    city: {
      en: enInfo.name,
      he: heInfo.name,
    },
    country: {
      en: enInfo.country,
      he: heInfo.country,
    },
  };
};

type CityInfoCoords = { name: string; country: string; id: string; lat: number; lon: number };

/**
 * Reverse-geocode coordinates to get city information (Geoapify)
 * @param lat - Latitude coordinate
 * @param lon - Longitude coordinate
 * @param lang - Language code ('en' or 'he')
 * @returns City information including name, country, ID, and coordinates
 */
export async function getCityInfoByCoords(
  lat: number,
  lon: number,
  lang = 'en',
): Promise<CityInfoCoords> {
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
    name: hit.address_line1 || hit.city, // Already in the requested language
    country: hit.country, // Full country name (not ISO code)
    id: getCityId(hit.lat, hit.lon),
    lat: hit.lat,
    lon: hit.lon,
  };
}