'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { SuggestionItem } from './SuggestionItem';
import { SuggestionsListProps } from '../types';

interface SuggestionsSkeletonProps {
  count?: number;
}

const SuggestionsSkeleton = ({ count = 5 }: SuggestionsSkeletonProps) => (
  <div className="space-y-2" aria-hidden="true" data-testid="suggestions-skeleton">
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2"
      >
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          <div className="space-y-2">
            <span className="block h-3 w-32 rounded-full bg-muted animate-pulse" />
            <span className="block h-3 w-16 rounded-full bg-muted/70 animate-pulse" />
          </div>
        </div>
        <span className="h-6 w-6 rounded-full bg-muted/60 animate-pulse" />
      </div>
    ))}
  </div>
);

export function SuggestionsList({
  suggestions,
  loading,
  hasSearched,
  selectedIndex,
  isAdding,
  handleSelect,
  className,
  direction = 'ltr',
}: SuggestionsListProps) {
  const t = useTranslations();

  const containerClasses = cn(
    'min-h-[14rem] max-h-80 overflow-y-auto px-3 py-2 transition-all duration-200',
    direction === 'rtl' ? 'text-right' : 'text-left',
    className,
  );

  const renderContent = () => {
    if (loading) {
      return <SuggestionsSkeleton />;
    }

    if (!hasSearched) {
      return (
        <div className="flex h-full items-center justify-center px-3 text-center text-sm text-muted-foreground">
          {t('search.startTyping')}
        </div>
      );
    }

    if (suggestions.length === 0) {
      return (
        <div className="flex h-full flex-col items-center justify-center px-3 text-center">
          <p className="text-sm font-medium text-muted-foreground mb-1">{t('search.noResults')}</p>
          <p className="text-xs text-muted-foreground">{t('search.noResultsDesc')}</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1" role="presentation">
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
  };

  const statusMessage = loading
    ? t('search.searching')
    : !hasSearched
    ? t('search.startTyping')
    : suggestions.length === 0
    ? t('search.noResults')
    : t('search.searchResults');

  return (
    <div className="flex flex-col" role="region" aria-label={t('search.searchResults')}>
      <div className={containerClasses} role="listbox" aria-live="polite" aria-busy={loading}>
        {renderContent()}
      </div>
      <p className="px-4 pb-3 pt-2 text-xs text-muted-foreground" role="status" aria-live="polite">
        {statusMessage}
      </p>
    </div>
  );
}
