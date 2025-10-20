// features/weather/fetchSuggestions.ts
import { CitySuggestion } from '@/types/suggestion';
import { AppLocale } from '@/types/i18n';
import { cache } from 'react';

/**
 * Fetches city suggestions from the API
 * Cached using React's cache function for improved performance and Suspense support
 * 
 * @param query - Search query string
 * @param lang - Language code (he/en)
 * @returns Promise with array of city suggestions
 */
const fetchSuggestionsImpl = cache(async (
  query: string, 
  lang: AppLocale = 'he'
): Promise<CitySuggestion[]> => {
  if (!query || query.length < 2) return [];
  
  try {
    const response = await fetch(
      `/api/suggest?q=${encodeURIComponent(query)}&lang=${lang}`,
      { 
        // Cache for 5 minutes - suggestions don't change frequently
        next: { revalidate: 300 }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch city suggestions');
    }

    const data: CitySuggestion[] = await response.json();
    return data;
  } catch {
    return [];
  }
});

export default fetchSuggestionsImpl;
export { fetchSuggestionsImpl as fetchSuggestions };