'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { SuggestionItem } from './SuggestionItem';
import { SuggestionsListProps } from '../types';

export function SuggestionsList({
  suggestions,
  loading,
  hasSearched,
  selectedIndex,
  isAdding,
  handleSelect,
  className
}: SuggestionsListProps) {
  const t = useTranslations();
  
  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-sm text-muted-foreground font-medium">
          {t('search.searching')}
        </p>
      </div>
    );
  }

  if (!hasSearched) {
    return null;
  }

  if (suggestions.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-muted-foreground font-medium mb-1">
          {t('search.noResults')}
        </p>
        <p className="text-xs text-muted-foreground">
          {t('search.noResultsDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className={`max-h-80 overflow-y-auto ${className || ''}`}>
      {suggestions.map((suggestion, index) => (
        <SuggestionItem
          key={suggestion.id}
          suggestion={suggestion}
          isSelected={index === selectedIndex}
          isAdding={isAdding === suggestion.id}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}
