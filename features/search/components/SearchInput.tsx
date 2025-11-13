'use client';

import type React from 'react';
import { forwardRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface SearchInputProps {
  query: string;
  loading: boolean;
  direction: 'ltr' | 'rtl';
  placeholder?: string;
  onQueryChange: (query: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onClear: () => void;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(({
  query,
  loading,
  direction,
  placeholder,
  onQueryChange,
  onFocus,
  onBlur,
  onKeyDown,
  onClear
}, ref) => {
  const t = useTranslations();

  return (
    <div className="relative flex-grow">
      <Input
        ref={ref}
        type="text"
        value={query}
        data-testid="city-search-input"
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={(e) => {
          // Normalize input to avoid mixed-direction artifacts like "לL oאnבdיoבn"
          const raw = e.target.value;
          const normalized = raw.normalize('NFC').replace(/\u200e|\u200f|\u202a|\u202b|\u202c|\u202d|\u202e/g, '');
          onQueryChange(normalized);
        }}
        onKeyDown={onKeyDown}
        placeholder={placeholder || t('search.placeholder')}
        aria-label={placeholder || t('search.placeholder')}
        className={cn(
          "w-full h-12 !text-lg shadow-sm transition-all rounded-2xl",
          "bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/10",
          "focus-visible:ring-sky-500/30 focus-visible:ring-2",
          "focus-visible:border-sky-500/50",
          direction === 'rtl' ? 'text-right pl-12 pr-8' : 'text-left pl-12 pr-8'
        )}
      />
      <div className={cn(
        "absolute top-1/2 transform -translate-y-1/2 transition-all duration-200",
        direction === 'rtl' ? 'right-3' : 'left-3'
      )}>
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-primary" role="status">
            <span className="sr-only">{t('search.loading')}</span>
          </Loader2>
        ) : (
          <Search className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      {query && (
        <button
          type="button"
          onClick={onClear}
          className={cn(
            "absolute top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors",
            direction === 'rtl' ? 'left-3' : 'right-3'
          )}
          title={t('search.clear')}
          aria-label={t('search.clear')}
        >
          <X className="h-4 w-4 text-muted-foreground hover:text-foreground" role="presentation" />
        </button>
      )}
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

export default SearchInput;

