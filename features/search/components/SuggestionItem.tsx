'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { AppLocale } from '@/types/i18n';
import { getDirection } from '@/lib/intl';
import { cn } from '@/lib/utils';
import { SuggestionItemProps } from '../types';

export function SuggestionItem({
  suggestion,
  isSelected,
  isAdding,
  onSelect,
  className
}: SuggestionItemProps) {
  const locale = useLocale() as AppLocale;
  const direction = getDirection(locale);

  const handleClick = () => {
    onSelect(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(suggestion);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={isAdding}
      className={cn(
        "w-full px-4 py-3 hover:bg-muted/50 focus:bg-muted/50 focus:outline-none transition-colors",
        "first:rounded-t-lg last:rounded-b-lg",
        direction === 'rtl' ? 'text-right' : 'text-left',
        isSelected && "bg-muted/50",
        isAdding && "opacity-50 cursor-not-allowed",
        className
      )}
      aria-selected={isSelected}
      role="option"
    >
      <div className={cn(
        "flex items-center justify-between",
        direction === 'rtl' ? 'flex-row-reverse' : 'flex-row'
      )}>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-foreground truncate">
            {suggestion.city[locale] || suggestion.city.en}
          </div>
          <div className="text-sm text-muted-foreground truncate">
            {suggestion.country[locale] || suggestion.country.en}
          </div>
        </div>
        {isAdding && (
          <div className={cn(
            "flex-shrink-0",
            direction === 'rtl' ? 'mr-2' : 'ml-2'
          )}>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    </button>
  );
}
