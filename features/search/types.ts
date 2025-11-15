/**
 * Search Feature Types
 * Type definitions for search-related functionality
 */

import { AppLocale } from '@/types/i18n';
import { CitySuggestion } from '@/types/suggestion';

// Re-export CitySuggestion as SearchSuggestion for backwards compatibility
export type SearchSuggestion = CitySuggestion;

// Search Component Props
export interface SearchBarProps {
  onSelect: () => void;
  placeholder?: string;
  className?: string;
}

export interface SuggestionsListProps {
  suggestions: SearchSuggestion[];
  loading: boolean;
  hasSearched: boolean;
  selectedIndex: number;
  isAdding: string | null;
  handleSelect: (suggestion: SearchSuggestion) => void;
  className?: string;
  direction?: 'ltr' | 'rtl';
}

export interface SuggestionItemProps {
  suggestion: SearchSuggestion;
  isSelected: boolean;
  isAdding: boolean;
  onSelect: (suggestion: SearchSuggestion) => void;
  className?: string;
}

export interface RecentSearchesProps {
  searches: string[];
  onSearchSelect: (query: string) => void;
  onClear: () => void;
  className?: string;
}

// Search API Types
export interface SearchInput {
  query: string;
  locale: AppLocale;
}

export interface SearchResponse {
  success: boolean;
  data?: SearchSuggestion[];
  error?: string;
}

// Search Store Types
export interface SearchStoreState {
  query: string;
  suggestions: SearchSuggestion[];
  recentSearches: string[];
  isLoading: boolean;
  hasSearched: boolean;
  error: string | null;
}

export interface SearchStoreActions {
  setQuery: (query: string) => void;
  setSuggestions: (suggestions: SearchSuggestion[]) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  setLoading: (loading: boolean) => void;
  setHasSearched: (searched: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

export type SearchStore = SearchStoreState & SearchStoreActions;
