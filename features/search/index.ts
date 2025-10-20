/**
 * Search Feature Exports
 * Central export point for search feature
 */

// Components
export { default as SearchBar } from './components/SearchBar';
export { SuggestionsList } from './components/SuggestionsList';
export { SuggestionItem } from './components/SuggestionItem';
export { RecentSearches } from './components/RecentSearches';

// API
export { SearchService, searchService } from './api/searchService';

// Store
export { useSearchStore } from './store/useSearchStore';

// Types
export type {
  SearchSuggestion,
  SearchBarProps,
  SuggestionsListProps,
  SuggestionItemProps,
  RecentSearchesProps,
  SearchInput,
  SearchResponse,
  SearchStoreState,
  SearchStoreActions,
  SearchStore,
} from './types';
