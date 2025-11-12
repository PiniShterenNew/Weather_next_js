import { GeoAPIResult } from '@/types/api';
import { CityTranslation } from '@/types/cache';
import { getCityId } from '@/lib/utils';

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

