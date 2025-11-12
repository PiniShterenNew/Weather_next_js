import { useEffect, useState } from 'react';
import { fetchSuggestions } from '@/features/weather';
import type { CitySuggestion } from '@/types/suggestion';
import type { AppLocale } from '@/types/i18n';

export interface UseSearchSuggestionsReturn {
  suggestions: CitySuggestion[];
  loading: boolean;
  hasSearched: boolean;
}

export function useSearchSuggestions(
  debouncedQuery: string,
  locale: AppLocale
): UseSearchSuggestionsReturn {
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions([]);
      setHasSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    let isCurrentRequest = true;

    fetchSuggestions(debouncedQuery, locale)
      .then((results) => {
        // Only update state if this is still the current request
        if (isCurrentRequest) {
          setSuggestions(results);
          setHasSearched(true);
        }
      })
      .catch(() => {
        if (isCurrentRequest) {
          setSuggestions([]);
          setHasSearched(true);
        }
      })
      .finally(() => {
        if (isCurrentRequest) {
          setLoading(false);
        }
      });

    // Cleanup function to cancel outdated requests
    return () => {
      isCurrentRequest = false;
    };
  }, [debouncedQuery, locale]);

  return {
    suggestions,
    loading,
    hasSearched
  };
}

