import { BilingualName, CityWeather, CityWeatherCurrent, WeatherCurrent, WeatherForecastItem, WeatherHourlyItem } from '@/types/weather';
import { GeoAPIResult, OpenWeatherForecastItem, OneCallResponse } from '@/types/api';
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
 * Format rain probability to percentage
 * @param probability - rain probability (0-1)
 * @returns formatted percentage string
 */
export function formatRainProbability(probability: number): string {
  return `${Math.round(probability * 100)}%`;
}

/**
 * Get UV Index description and risk level
 * @param uvIndex - UV Index value
 * @returns object with description and risk level
 */
export function getUVIndexInfo(uvIndex: number): { description: string; risk: 'low' | 'moderate' | 'high' | 'very-high' | 'extreme' } {
  if (uvIndex <= 2) return { description: 'Low', risk: 'low' };
  if (uvIndex <= 5) return { description: 'Moderate', risk: 'moderate' };
  if (uvIndex <= 7) return { description: 'High', risk: 'high' };
  if (uvIndex <= 10) return { description: 'Very High', risk: 'very-high' };
  return { description: 'Extreme', risk: 'extreme' };
}

/**
 * Check if city timezone matches user's timezone
 * @param cityTz - city timezone offset in seconds
 * @param userTz - user timezone offset (optional)
 * @returns true if timezones are the same
 */
export function isSameTimezone(cityTz: number, userTz: number): boolean {
  // Handle undefined or null values
  if (cityTz === undefined || cityTz === null || userTz === undefined || userTz === null) {
    return false;
  }
  
  // Compare timezone offsets (in seconds)
  return Math.abs(cityTz - userTz) < 60; // Allow 1 minute difference for rounding
}

/**
 * Format time for a specific timezone offset - FIXED VERSION
 * @param timestamp - UTC timestamp in seconds
 * @param offset - timezone offset in seconds
 * @returns formatted time string (HH:MM)
 */
export function formatTimeWithOffset(timestamp: number, offsetSeconds: number, userOffsetSeconds?: number): string {
  // Validate inputs
  if (timestamp === null || timestamp === undefined || isNaN(timestamp) || isNaN(offsetSeconds)) {
    return '--:--';
  }

  // If user offset is provided and different from city offset, show both times
  if (userOffsetSeconds !== undefined && userOffsetSeconds !== offsetSeconds) {
    const cityTime = new Date(timestamp * 1000 + offsetSeconds * 1000);
    const userTime = new Date(timestamp * 1000 + userOffsetSeconds * 1000);
    
    const cityHours = cityTime.getUTCHours().toString().padStart(2, '0');
    const cityMinutes = cityTime.getUTCMinutes().toString().padStart(2, '0');
    const userHours = userTime.getUTCHours().toString().padStart(2, '0');
    const userMinutes = userTime.getUTCMinutes().toString().padStart(2, '0');
    
    return `${cityHours}:${cityMinutes} (${userHours}:${userMinutes})`;
  }

  const date = new Date(timestamp * 1000 + offsetSeconds * 1000);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return '--:--';
  }

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

    // Format using local time since we already calculated the city time
    
    // For Hebrew, show day with Hebrew letter
    if (locale === 'he') {
      const dayOfWeek = cityTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const hebrewDays = ['יום א\'', 'יום ב\'', 'יום ג\'', 'יום ד\'', 'יום ה\'', 'יום ו\'', 'יום ש\''];
      return hebrewDays[dayOfWeek];
    }
    // For English, show day number and abbreviated day
    const dayNumber = cityTime.getDate();
    const shortWeekday = cityTime.toLocaleDateString(locale, { weekday: 'short' });
    return `${dayNumber} ${shortWeekday}`;
  }

  // No offset - use user's local time
  
  // For Hebrew, show day with Hebrew letter
  if (locale === 'he') {
    const dayOfWeek = utcDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const hebrewDays = ['יום א\'', 'יום ב\'', 'יום ג\'', 'יום ד\'', 'יום ה\'', 'יום ו\'', 'יום ש\''];
    return hebrewDays[dayOfWeek];
  }
  // For English, show day number and abbreviated day
  const dayNumber = utcDate.getDate();
  const shortWeekday = utcDate.toLocaleDateString(locale, { weekday: 'short' });
  return `${dayNumber} ${shortWeekday}`;
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
  
  if (!API_KEY) {
    throw new Error('OpenWeatherMap API key is not configured');
  }

  const urls = {
    he: {
      current: `https://api.openweathermap.org/data/2.5/weather?lat=${input.lat}&lon=${input.lon}&appid=${API_KEY}&units=metric&lang=he`,
      forecast: `https://api.openweathermap.org/data/2.5/forecast?lat=${input.lat}&lon=${input.lon}&appid=${API_KEY}&units=metric&lang=he`,
      oneCall: `https://api.openweathermap.org/data/2.5/onecall?lat=${input.lat}&lon=${input.lon}&appid=${API_KEY}&units=metric&exclude=minutely,alerts`
    },
    en: {
      current: `https://api.openweathermap.org/data/2.5/weather?lat=${input.lat}&lon=${input.lon}&appid=${API_KEY}&units=metric&lang=en`,
      forecast: `https://api.openweathermap.org/data/2.5/forecast?lat=${input.lat}&lon=${input.lon}&appid=${API_KEY}&units=metric&lang=en`,
      oneCall: `https://api.openweathermap.org/data/2.5/onecall?lat=${input.lat}&lon=${input.lon}&appid=${API_KEY}&units=metric&exclude=minutely,alerts`
    }
  };

  const fetchWeatherData = async (lang: 'he' | 'en'): Promise<CityWeatherCurrent> => {
    const [currentResponse, forecastResponse, oneCallResponse] = await Promise.all([
      fetch(urls[lang].current),
      fetch(urls[lang].forecast),
      fetch(urls[lang].oneCall).catch(() => null), // Allow OneCall to fail gracefully
    ]);

    if (!currentResponse.ok || !forecastResponse.ok) {
      throw new Error(`Failed to fetch weather for lang: ${lang}`);
    }

    const currentJson = await currentResponse.json();
    const forecastJson = await forecastResponse.json();
    
    
    // Parse OneCall response if available
    let oneCallJson: OneCallResponse | null = null;
    if (oneCallResponse && oneCallResponse.ok) {
      try {
        oneCallJson = await oneCallResponse.json() as OneCallResponse;
      } catch {
        // Ignore OneCall parsing errors
      }
    }

    const grouped = groupForecastByDay(forecastJson.list);
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's min/max temperatures from forecast data (24 hours)
    const todayForecast = grouped.find(([date]) => date === today);
    let todayMin = currentJson.main.temp_min;
    let todayMax = currentJson.main.temp_max;
    
    // Get today's highest rain probability from forecast
    let todayMaxRainProbability: number | undefined;
    if (todayForecast && todayForecast[1].length > 0) {
      const todayTemps = todayForecast[1].map((item) => item.main);
      todayMin = Math.min(...todayTemps.map((t) => t.temp_min));
      todayMax = Math.max(...todayTemps.map((t) => t.temp_max));
      
      // Get max rain probability for today
      const rainProbabilities = todayForecast[1]
        .map((item) => item.pop)
        .filter((pop) => pop !== undefined);
      if (rainProbabilities.length > 0) {
        todayMaxRainProbability = Math.max(...rainProbabilities);
      }
    }

    const current: WeatherCurrent = {
      codeId: currentJson.weather[0].id,
      temp: currentJson.main.temp,
      feelsLike: currentJson.main.feels_like,
      tempMin: todayMin, // ← עכשיו זה מינימום של היום הנוכחי
      tempMax: todayMax, // ← עכשיו זה מקסימום של היום הנוכחי
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
      uvIndex: oneCallJson?.current?.uvi, // UV Index from OneCall API
      rainProbability: todayMaxRainProbability, // Rain probability from forecast API
    };


    // תחזית יומית (5 ימים)
    const forecast: WeatherForecastItem[] = grouped
      .filter(([date]) => date > today)
      .slice(0, 5)
      .map(([date, items]) => {
        const temps = items.map((i) => i.main);
        const weatherMidday =
          items.find((i) => i.dt_txt.includes('12:00:00')) || items[Math.floor(items.length / 2)];

        return {
          date: new Date(date + 'T00:00:00').getTime(),
          min: Math.min(...temps.map((t) => t.temp_min)),
          max: Math.max(...temps.map((t) => t.temp_max)),
          icon: weatherMidday.weather[0].icon,
          desc: weatherMidday.weather[0].description,
          codeId: weatherMidday.weather[0].id,
          // מידע נוסף - ממוצע של היום
          humidity: Math.round(items.reduce((sum, item) => sum + item.main.humidity, 0) / items.length),
          wind: Math.round((items.reduce((sum, item) => sum + item.wind.speed, 0) / items.length) * 10) / 10,
          clouds: Math.round(items.reduce((sum, item) => sum + item.clouds.all, 0) / items.length),
        };
      });

    // תחזית שעתית (הבא 24 שעות)
    const hourly: WeatherHourlyItem[] = forecastJson.list
      .slice(0, 8) // הבא 8 מדידות (24 שעות)
      .map((item: OpenWeatherForecastItem) => ({
        time: item.dt * 1000, // Convert to milliseconds
        temp: item.main.temp,
        icon: item.weather[0].icon,
        desc: item.weather[0].description,
        codeId: item.weather[0].id,
        wind: item.wind.speed,
        humidity: item.main.humidity,
      }));

    return {
      current,
      forecast,
      hourly,
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

  // Sort by date to ensure correct order
  return Object.entries(days).sort(([a], [b]) => a.localeCompare(b));
}

const GEOAPIFY_KEY = process.env.GEOAPIFY_KEY as string;

async function fetchGeoapify(query: string, lang: 'he' | 'en') {
  if (!GEOAPIFY_KEY) {
    // eslint-disable-next-line no-console
    console.error('GEOAPIFY_KEY is not defined in environment variables');
    throw new Error('Geoapify API key is missing');
  }

  // Increase limit and expand search types for better results
  const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&limit=10&type=city&lang=${lang}&format=json&apiKey=${GEOAPIFY_KEY}`;
  const res = await fetch(url);
  
  if (!res.ok) {
    const errorText = await res.text();
    // eslint-disable-next-line no-console
    console.error(`Geoapify API error (${lang}): ${res.status} - ${errorText}`);
    throw new Error(`Geoapify error (${lang}): ${res.status}`);
  }

  const data = await res.json();
  const results = (data.results || []) as GeoAPIResult[];

  // Expanded allowed types to include more city variations
  const allowedTypes = ['city', 'town', 'village', 'locality', 'district', 'municipality', 'suburb', 'state_district'];

  // Filter results and check relevance to search query
  const cleanQuery = query.toLowerCase().trim();
  
  const filteredResults = results.filter((item) => {
    const resultType = item.result_type || '';
    const cityName = (item.city || '').toLowerCase();
    const addressLine = (item.address_line1 || '').toLowerCase();
    
    // Check if result type is allowed
    if (!allowedTypes.includes(resultType) || !item.city || !item.lat || !item.lon) {
      return false;
    }
    
    // Check relevance to search query - reject results that don't match well
    const matchesCityName = cityName.includes(cleanQuery) || cleanQuery.includes(cityName.split(' ')[0]);
    const matchesAddress = addressLine.includes(cleanQuery);
    
    // Only include results that have some relevance to the search query
    return matchesCityName || matchesAddress;
  });

  // Sort by relevance to search query
  return filteredResults.sort((a, b) => {
    const aCityName = (a.city || '').toLowerCase();
    const bCityName = (b.city || '').toLowerCase();
    const aAddress = (a.address_line1 || '').toLowerCase();
    const bAddress = (b.address_line1 || '').toLowerCase();
    
    // Priority 1: Exact match at the beginning of city name
    const aStartsWithQuery = aCityName.startsWith(cleanQuery);
    const bStartsWithQuery = bCityName.startsWith(cleanQuery);
    
    if (aStartsWithQuery && !bStartsWithQuery) return -1;
    if (!aStartsWithQuery && bStartsWithQuery) return 1;
    
    // Priority 2: Exact match in address line
    const aAddressMatch = aAddress.includes(cleanQuery);
    const bAddressMatch = bAddress.includes(cleanQuery);
    
    if (aAddressMatch && !bAddressMatch) return -1;
    if (!aAddressMatch && bAddressMatch) return 1;
    
    // Priority 3: Better city type (city/municipality over town/village)
    const aIsBetterType = ['city', 'municipality'].includes(a.result_type || '');
    const bIsBetterType = ['city', 'municipality'].includes(b.result_type || '');
    
    if (aIsBetterType && !bIsBetterType) return -1;
    if (!aIsBetterType && bIsBetterType) return 1;
    
    return 0;
  }).slice(0, 8); // Return top 8 results
}

export async function getSuggestionsForDB(query: string, lang: 'he' | 'en') {
  try {
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

      // Get fallback language data
      try {
        const fallback = await getCityInfoByCoords(item.lat, item.lon, fallbackLang);
        if (fallbackLang === 'he') {
          entry.city.he = fallback.name;
          entry.country.he = fallback.country;
        } else {
          entry.city.en = fallback.name;
          entry.country.en = fallback.country;
        }
      } catch {
        // If fallback fails, continue with primary language data
      }
    }

    // If no results found with primary search, try with fallback language
    if (cityMap.size === 0) {
      try {
        const alternativeResults = await fetchGeoapify(query, fallbackLang);
        
        for (const item of alternativeResults) {
          const id = getCityId(item.lat, item.lon);
          const cityName = item.address_line1 || item.city || '';
          const countryName = item.country || '';

          // Only add if not already exists
          if (!cityMap.has(id)) {
            cityMap.set(id, {
              id,
              lat: item.lat,
              lon: item.lon,
              city: { en: '', he: '' },
              country: { en: '', he: '' },
            });

            const entry = cityMap.get(id)!;
            if (fallbackLang === 'he') {
              entry.city.he = cityName;
              entry.country.he = countryName;
            } else {
              entry.city.en = cityName;
              entry.country.en = countryName;
            }
          }
        }
      } catch {
        // If alternative search also fails, return empty array
      }
    }

    // Return unique results limited to 6 to prevent too many duplicates
    return Array.from(cityMap.values()).slice(0, 6);
  } catch (error) {
    // If all searches fail, return empty array
    // Only log in development
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error(`Failed to get suggestions for query "${query}"`, error);
    }
    return [];
  }
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

/**
 * Get dynamic background image class based on weather condition code and time
 * @param weatherCode - OpenWeather condition code
 * @param isNight - Whether it's nighttime (optional, defaults to false)
 * @returns Tailwind background class
 */
export function getWeatherBackground(weatherCode: number, isNight: boolean = false): string {
  // Night backgrounds
  if (isNight) {
    // Thunderstorm, rain, drizzle at night
    if (weatherCode >= 200 && weatherCode < 600) {
      return 'bg-rainy-day';
    }
    // Snow at night
    if (weatherCode >= 600 && weatherCode < 700) {
      return 'bg-snowy-day';
    }
    // Cloudy at night
    if (weatherCode >= 801 && weatherCode <= 804) {
      return 'bg-night-cloudy';
    }
    // Clear night
    return 'bg-night-clear';
  }

  // Day backgrounds
  // Thunderstorm (200-232)
  if (weatherCode >= 200 && weatherCode < 300) {
    return 'bg-rainy-day';
  }
  
  // Drizzle (300-321)
  if (weatherCode >= 300 && weatherCode < 400) {
    return 'bg-rainy-day';
  }
  
  // Rain (500-531)
  if (weatherCode >= 500 && weatherCode < 600) {
    return 'bg-rainy-day';
  }
  
  // Snow (600-622)
  if (weatherCode >= 600 && weatherCode < 700) {
    return 'bg-snowy-day';
  }
  
  // Atmosphere (mist, fog, etc.) (701-781)
  if (weatherCode >= 700 && weatherCode < 800) {
    return 'bg-cloudy-day';
  }
  
  // Clear sky (800)
  if (weatherCode === 800) {
    return 'bg-sunny-day';
  }
  
  // Clouds (801-804)
  if (weatherCode >= 801 && weatherCode <= 804) {
    return 'bg-cloudy-day';
  }
  
  // Default to cloudy
  return 'bg-cloudy-day';
}

/**
 * Check if it's nighttime based on current time and sunrise/sunset
 * @param currentTime - Current timestamp in seconds
 * @param sunrise - Sunrise timestamp in seconds
 * @param sunset - Sunset timestamp in seconds
 * @returns true if it's nighttime
 */
export function isNightTime(currentTime: number, sunrise: number, sunset: number): boolean {
  return currentTime < sunrise || currentTime > sunset;
}