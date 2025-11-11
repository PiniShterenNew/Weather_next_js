import { CityWeather } from '@/types/weather';
import { GeoAPIResult } from '@/types/api';
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
 * Convert timezone string to offset in seconds
 * @param timezone - timezone string (e.g., 'Asia/Jerusalem')
 * @returns timezone offset in seconds
 */
export function getTimezoneOffset(timezone: string): number {
  if (!timezone) return 0;
  
  try {
    // Get current time
    const now = new Date();
    
    // Get the same moment in the target timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const parts = formatter.formatToParts(now);
    const getValue = (type: string) => parts.find(p => p.type === type)?.value || '0';
    
    // Create a date in the target timezone
    const tzDate = new Date(
      parseInt(getValue('year')),
      parseInt(getValue('month')) - 1,
      parseInt(getValue('day')),
      parseInt(getValue('hour')),
      parseInt(getValue('minute')),
      parseInt(getValue('second'))
    );
    
    // Calculate offset in seconds
    // The offset is the difference between the timezone time and UTC time
    const offset = (tzDate.getTime() - now.getTime()) / 1000;
    return offset;
  } catch {
    return 0;
  }
}

/**
 * Check if city timezone matches user's timezone
 * @param cityTz - city timezone (string or offset in seconds)
 * @param userTz - user timezone offset in seconds
 * @returns true if timezones are the same
 */
export function isSameTimezone(cityTz: string | number, userTz: number): boolean {
  // Handle undefined or null values
  if (cityTz === undefined || cityTz === null || userTz === undefined || userTz === null) {
    return false;
  }
  
  // If cityTz is a string (timezone name), compare by formatting the same time in both timezones
  if (typeof cityTz === 'string') {
    try {
      const now = new Date();
      
      // Format time in city timezone
      const cityTime = formatTimeWithTimezone(Math.floor(now.getTime() / 1000), cityTz);
      
      // Format time in user timezone (by calculating user's timezone name)
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const userTime = formatTimeWithTimezone(Math.floor(now.getTime() / 1000), userTimezone);
      
      // If times are the same, timezones are the same
      return cityTime === userTime;
    } catch {
      return false;
    }
  }
  
  // If cityTz is a number (offset), compare offsets
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
 * Format time for Open-Meteo timezone string
 * @param timestamp - UTC timestamp in seconds
 * @param timezone - timezone string (e.g., 'Asia/Jerusalem')
 * @returns formatted time string (HH:MM)
 */
export function formatTimeWithTimezone(timestamp: number, timezone: string): string {
  if (timestamp === null || timestamp === undefined || isNaN(timestamp) || !timezone) {
    return '--:--';
  }

  try {
    const date = new Date(timestamp * 1000);
    const timeString = date.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return timeString;
  } catch {
    return '--:--';
  }
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


const GEOAPIFY_KEY = process.env.GEOAPIFY_KEY as string;

/**
 * Helper function to ensure we get full country name instead of country code
 * @param country - Country name from Geoapify
 * @param countryCode - Country code from Geoapify
 * @param lang - Language preference
 * @returns Full country name in the correct language
 */
function getFullCountryName(country: string, countryCode: string, lang: 'he' | 'en'): string {
  // If we already have a full country name, check if it's in the right language
  if (country && country.length > 2 && !country.match(/^[A-Z]{2}$/)) {
    // Check if the country name contains Hebrew characters (for Hebrew language)
    const hasHebrewChars = /[\u0590-\u05FF]/.test(country);
    
    if (lang === 'he' && hasHebrewChars) {
      return country; // Hebrew name for Hebrew language
    } else if (lang === 'en' && !hasHebrewChars) {
      return country; // English name for English language
    }
    // If we have a name in the wrong language, we'll need to convert it
    // Try to find the equivalent in the target language
    const reverseMappings: Record<string, { en: string; he: string }> = {
      'ישראל': { en: 'Israel', he: 'ישראל' },
      'ארצות הברית': { en: 'United States', he: 'ארצות הברית' },
      'בריטניה': { en: 'United Kingdom', he: 'בריטניה' },
      'צרפת': { en: 'France', he: 'צרפת' },
      'גרמניה': { en: 'Germany', he: 'גרמניה' },
      'איטליה': { en: 'Italy', he: 'איטליה' },
      'ספרד': { en: 'Spain', he: 'ספרד' },
      'רוסיה': { en: 'Russia', he: 'רוסיה' },
      'סין': { en: 'China', he: 'סין' },
      'יפן': { en: 'Japan', he: 'יפן' },
      'הודו': { en: 'India', he: 'הודו' },
      'ברזיל': { en: 'Brazil', he: 'ברזיל' },
      'קנדה': { en: 'Canada', he: 'קנדה' },
      'אוסטרליה': { en: 'Australia', he: 'אוסטרליה' },
      'מקסיקו': { en: 'Mexico', he: 'מקסיקו' },
      'ארגנטינה': { en: 'Argentina', he: 'ארגנטינה' },
      'מצרים': { en: 'Egypt', he: 'מצרים' },
      'טורקיה': { en: 'Turkey', he: 'טורקיה' },
      'ערב הסעודית': { en: 'Saudi Arabia', he: 'ערב הסעודית' },
      'איחוד האמירויות הערביות': { en: 'United Arab Emirates', he: 'איחוד האמירויות הערביות' },
      'ירדן': { en: 'Jordan', he: 'ירדן' },
      'לבנון': { en: 'Lebanon', he: 'לבנון' },
      'סוריה': { en: 'Syria', he: 'סוריה' },
      'עיראק': { en: 'Iraq', he: 'עיראק' },
      'איראן': { en: 'Iran', he: 'איראן' },
      'פלסטין': { en: 'Palestine', he: 'פלסטין' },
      // English to Hebrew mappings
      'Israel': { en: 'Israel', he: 'ישראל' },
      'United States': { en: 'United States', he: 'ארצות הברית' },
      'United Kingdom': { en: 'United Kingdom', he: 'בריטניה' },
      'France': { en: 'France', he: 'צרפת' },
      'Germany': { en: 'Germany', he: 'גרמניה' },
      'Italy': { en: 'Italy', he: 'איטליה' },
      'Spain': { en: 'Spain', he: 'ספרד' },
      'Russia': { en: 'Russia', he: 'רוסיה' },
      'China': { en: 'China', he: 'סין' },
      'Japan': { en: 'Japan', he: 'יפן' },
      'India': { en: 'India', he: 'הודו' },
      'Brazil': { en: 'Brazil', he: 'ברזיל' },
      'Canada': { en: 'Canada', he: 'קנדה' },
      'Australia': { en: 'Australia', he: 'אוסטרליה' },
      'Mexico': { en: 'Mexico', he: 'מקסיקו' },
      'Argentina': { en: 'Argentina', he: 'ארגנטינה' },
      'Egypt': { en: 'Egypt', he: 'מצרים' },
      'Turkey': { en: 'Turkey', he: 'טורקיה' },
      'Saudi Arabia': { en: 'Saudi Arabia', he: 'ערב הסעודית' },
      'United Arab Emirates': { en: 'United Arab Emirates', he: 'איחוד האמירויות הערביות' },
      'Jordan': { en: 'Jordan', he: 'ירדן' },
      'Lebanon': { en: 'Lebanon', he: 'לבנון' },
      'Syria': { en: 'Syria', he: 'סוריה' },
      'Iraq': { en: 'Iraq', he: 'עיראק' },
      'Iran': { en: 'Iran', he: 'איראן' },
      'Palestine': { en: 'Palestine', he: 'פלסטין' }
    };
    
    const mapping = reverseMappings[country];
    if (mapping) {
      return mapping[lang];
    }
  }
  
  // If we only have a country code, try to get the full name
  if (countryCode && countryCode.length === 2) {
    // Common country code mappings
    const countryMappings: Record<string, { en: string; he: string }> = {
      'IL': { en: 'Israel', he: 'ישראל' },
      'US': { en: 'United States', he: 'ארצות הברית' },
      'GB': { en: 'United Kingdom', he: 'בריטניה' },
      'FR': { en: 'France', he: 'צרפת' },
      'DE': { en: 'Germany', he: 'גרמניה' },
      'IT': { en: 'Italy', he: 'איטליה' },
      'ES': { en: 'Spain', he: 'ספרד' },
      'RU': { en: 'Russia', he: 'רוסיה' },
      'CN': { en: 'China', he: 'סין' },
      'JP': { en: 'Japan', he: 'יפן' },
      'IN': { en: 'India', he: 'הודו' },
      'BR': { en: 'Brazil', he: 'ברזיל' },
      'CA': { en: 'Canada', he: 'קנדה' },
      'AU': { en: 'Australia', he: 'אוסטרליה' },
      'MX': { en: 'Mexico', he: 'מקסיקו' },
      'AR': { en: 'Argentina', he: 'ארגנטינה' },
      'EG': { en: 'Egypt', he: 'מצרים' },
      'TR': { en: 'Turkey', he: 'טורקיה' },
      'SA': { en: 'Saudi Arabia', he: 'ערב הסעודית' },
      'AE': { en: 'United Arab Emirates', he: 'איחוד האמירויות הערביות' },
      'JO': { en: 'Jordan', he: 'ירדן' },
      'LB': { en: 'Lebanon', he: 'לבנון' },
      'SY': { en: 'Syria', he: 'סוריה' },
      'IQ': { en: 'Iraq', he: 'עיראק' },
      'IR': { en: 'Iran', he: 'איראן' },
      'PS': { en: 'Palestine', he: 'פלסטין' }
    };
    
    const mapping = countryMappings[countryCode.toUpperCase()];
    if (mapping) {
      return mapping[lang];
    }
  }
  
  // Fallback to original country or countryCode
  return country || countryCode;
}

async function fetchGeoapify(query: string, lang: 'he' | 'en') {
  if (!GEOAPIFY_KEY) {
    // eslint-disable-next-line no-console
    console.error('GEOAPIFY_KEY is not defined in environment variables');
    throw new Error('Geoapify API key is missing');
  }

  // Increase limit and expand search types for better results
  const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&limit=10&type=city&lang=${lang}&format=json&apiKey=${GEOAPIFY_KEY}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json; charset=utf-8',
    },
  });
  
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
      // Choose the best city name - prioritize formatted name or address_line1
      const cityName = item.formatted?.split(',')[0] || item.address_line1 || item.city || '';
      // Use full country name in correct language, not country code
      const countryName = getFullCountryName(item.country, item.country_code, lang);

      // Log detailed information about what we receive
      // eslint-disable-next-line no-console
      console.log('🔍 City Search Result:', {
        id,
        lat: item.lat,
        lon: item.lon,
        cityName,
        countryName,
        fullItem: item,
        address_line1: item.address_line1,
        city: item.city,
        country: item.country,
        country_code: item.country_code,
        state: item.state,
        county: item.county,
        suburb: item.suburb,
        postcode: item.postcode,
        formatted: item.formatted
      });

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
        // eslint-disable-next-line no-console
        console.log('⚠️ Fallback translation failed for:', cityName, 'in', countryName);
      }
    }

    // If no results found with primary search, try with fallback language
    if (cityMap.size === 0) {
      try {
        const alternativeResults = await fetchGeoapify(query, fallbackLang);
        
        for (const item of alternativeResults) {
          const id = getCityId(item.lat, item.lon);
          const cityName = item.address_line1 || item.city || '';
          // Use full country name in correct language, not country code
          const countryName = getFullCountryName(item.country, item.country_code, fallbackLang);

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
      en: getFullCountryName(enInfo.country, '', 'en'),
      he: getFullCountryName(heInfo.country, '', 'he'),
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
  lang: 'he' | 'en' = 'en',
): Promise<CityInfoCoords> {
  const GEOAPIFY_KEY = process.env.GEOAPIFY_KEY as string;
  const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&lang=${lang}&type=city&format=json&apiKey=${GEOAPIFY_KEY}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json; charset=utf-8',
    },
  });
  if (!response.ok) throw new Error('Geoapify reverse-geocode failed');

  const json = await response.json();
  const hit = json.results?.[0];
  if (!hit?.city || !hit?.country) {
    throw new Error('City not found for coords');
  }

  // Log what we get from reverse geocoding
  // eslint-disable-next-line no-console
  console.log('🌍 Reverse Geocoding Result:', {
    lang,
    inputCoords: { lat, lon },
    apiCoords: { lat: hit.lat, lon: hit.lon },
    address_line1: hit.address_line1,
    city: hit.city,
    country: hit.country,
    formatted: hit.formatted,
    result_type: hit.result_type,
    fullHit: hit
  });

  // Validate coordinates match (within reasonable tolerance)
  const coordDiff = Math.abs(hit.lat - lat) + Math.abs(hit.lon - lon);
  if (coordDiff > 0.1) {
    // eslint-disable-next-line no-console
    console.warn('⚠️ Warning: Reverse geocoding coordinates mismatch:', {
      requested: { lat, lon },
      returned: { lat: hit.lat, lon: hit.lon },
      difference: coordDiff
    });
  }

  // Validate city data exists
  if (!hit.city && !hit.address_line1 && !hit.formatted) {
    throw new Error('Invalid reverse geocoding result: missing city name');
  }

  return {
    name: hit.formatted?.split(',')[0] || hit.address_line1 || hit.city, // Use formatted name first
    country: getFullCountryName(hit.country, hit.country_code || '', lang), // Ensure full country name in correct language
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