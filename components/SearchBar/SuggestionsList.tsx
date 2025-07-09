'use client';

import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, MapPin, Search } from 'lucide-react';
import { CitySuggestion } from '@/types/suggestion';
import { SuggestionItem } from './SuggestionItem';

interface SuggestionsListProps {
  suggestions: CitySuggestion[];
  loading: boolean;
  hasSearched: boolean;
  selectedIndex: number;
  isAdding: string | null;
  handleSelect: (city: CitySuggestion) => void;
}

/**
 * Loading fallback component for suggestions list
 */
function SuggestionsLoading() {
  const t = useTranslations();
  
  return (
    <div className="p-6 text-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
      <p className="text-sm text-muted-foreground font-medium">
        {t('loading')}
      </p>
    </div>
  );
}

/**
 * Component that displays search suggestions
 * Wrapped in Suspense for better loading experience
 */
export function SuggestionsList({
  suggestions,
  loading,
  hasSearched,
  selectedIndex,
  isAdding,
  handleSelect
}: SuggestionsListProps) {
  const t = useTranslations();

  // If we're loading, show loading state
  if (loading) {
    return <SuggestionsLoading />;
  }

  // If we have suggestions, show them
  if (suggestions.length > 0) {
    return (
      <div className="py-2">
        <Suspense fallback={<SuggestionsLoading />}>
          {suggestions.map((city, index) => (
            <SuggestionItem
              key={city.id}
              city={city}
              index={index}
              selectedIndex={selectedIndex}
              isAdding={isAdding}
              handleSelect={handleSelect}
            />
          ))}
        </Suspense>
      </div>
    );
  }

  // If we searched but have no results
  if (hasSearched && !loading) {
    return (
      <div className="p-6 text-center">
        <MapPin className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground font-medium">
          {t('search.noResults')}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {t('search.noResultsDesc')}
        </p>
      </div>
    );
  }

  // Default state - no search yet
  return (
    <div className="p-6 text-center">
      <div className="text-muted-foreground">
        <Search className="h-6 w-6 mx-auto mb-2" />
        <p className="text-sm font-medium">
          {t('search.typeToSearch')}
        </p>
        <p className="text-xs mt-1">
          {t('search.startTyping')}
        </p>
      </div>
    </div>
  );
}
