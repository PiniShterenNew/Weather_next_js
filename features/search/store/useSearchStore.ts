/**
 * Search Store
 * Zustand store for search state management
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { SearchSuggestion, SearchStore } from '../types';
import { searchService } from '../api/searchService';
import { AppLocale } from '@/types/i18n';

const useSearchStore = create<SearchStore>()(
  devtools(
    (set, get) => ({
      // State
      query: '',
      suggestions: [],
      recentSearches: [],
      isLoading: false,
      hasSearched: false,
      error: null,

      // Actions
      setQuery: (query: string) => {
        set({ query });
      },

      setSuggestions: (suggestions: SearchSuggestion[]) => {
        set({ suggestions });
      },

      addRecentSearch: (query: string) => {
        set((state) => {
          // Remove if already exists
          const filtered = state.recentSearches.filter(s => s !== query);
          // Add to beginning and limit to 10
          return {
            recentSearches: [query, ...filtered].slice(0, 10),
          };
        });
      },

      clearRecentSearches: () => {
        set({ recentSearches: [] });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setHasSearched: (searched: boolean) => {
        set({ hasSearched: searched });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set({
          query: '',
          suggestions: [],
          hasSearched: false,
          error: null,
        });
      },

      // Async actions
      searchCities: async (query: string, locale: AppLocale) => {
        if (query.length < 2) {
          set({ suggestions: [], hasSearched: false });
          return [];
        }

        set({ isLoading: true, error: null });

        try {
          const response = await searchService.searchCities({ query, locale });
          
          if (response.success && response.data) {
            set({ 
              suggestions: response.data, 
              hasSearched: true,
              error: null 
            });
            return response.data;
          } else {
            set({ 
              error: response.error || 'Failed to search cities',
              suggestions: [],
              hasSearched: true 
            });
            return [];
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          set({ 
            error: errorMessage,
            suggestions: [],
            hasSearched: true 
          });
          return [];
        } finally {
          set({ isLoading: false });
        }
      },

      reverseGeocode: async (lat: number, lon: number, locale: AppLocale) => {
        set({ isLoading: true, error: null });

        try {
          const response = await searchService.reverseGeocode(lat, lon, locale);
          
          if (response.success && response.data) {
            set({ 
              suggestions: response.data, 
              hasSearched: true,
              error: null 
            });
            return response.data;
          } else {
            set({ 
              error: response.error || 'Failed to get location',
              suggestions: [],
              hasSearched: true 
            });
            return [];
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          set({ 
            error: errorMessage,
            suggestions: [],
            hasSearched: true 
          });
          return [];
        } finally {
          set({ isLoading: false });
        }
      },

      selectSuggestion: (suggestion: SearchSuggestion) => {
        // Add to recent searches
        get().addRecentSearch(suggestion.city.he || suggestion.city.en);
        
        // Clear current search
        get().reset();
        
        return suggestion;
      },
    }),
    {
      name: 'search-store',
    }
  )
);

export { useSearchStore };
