'use client';
import React from 'react';
import { useEffect, useState, useRef, Suspense } from 'react';
import { fetchSuggestions, fetchWeather } from '@/features/weather';
import { useWeatherStore } from '@/stores/useWeatherStore';
import { Input } from '@/components/ui/input';
import { Search, X, Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { CitySuggestion } from '@/types/suggestion';
import { useDebounce } from '@/lib/useDebounce';
import { AppLocale } from '@/types/i18n';
import { getDirection } from '@/lib/intl';
import { cn } from '@/lib/utils';
import { SuggestionsList } from './SuggestionsList';

interface SearchBarProps {
  onSelect: () => void;
}

/**
 * SearchBar component with autocomplete functionality
 * Uses Suspense for improved loading experience
 */
export default function SearchBar({ onSelect }: SearchBarProps) {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const direction = getDirection(locale);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);

  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isAdding, setIsAdding] = useState<string | null>(null);

  const [showDropdown, setShowDropdown] = useState(false);
  const [focused, setFocused] = useState(false);

  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const addCity = useWeatherStore((s) => s.addCity);
  const showToast = useWeatherStore((s) => s.showToast);
  const setIsLoading = useWeatherStore((s) => s.setIsLoading);

  // Handle search input
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions([]);
      setHasSearched(false);
      setSelectedIndex(-1);
      setLoading(false);
      return;
    }

    setLoading(true);
    setSelectedIndex(-1);

    fetchSuggestions(debouncedQuery, locale)
      .then((results) => {
        setSuggestions(results);
        setHasSearched(true);
      })
      .catch(() => {
        setSuggestions([]);
        setHasSearched(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [debouncedQuery, locale]);

  // Handle dropdown display
  useEffect(() => {
    const shouldShow = query.length >= 2 && focused;

    if (shouldShow) {
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
        hideTimeout.current = null;
      }
      setShowDropdown(true);
    } else {
      if (showDropdown) {
        if (hideTimeout.current) clearTimeout(hideTimeout.current);
        hideTimeout.current = setTimeout(() => {
          setShowDropdown(false);
          hideTimeout.current = null;
        }, 150);
      }
    }

    return () => {
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
        hideTimeout.current = null;
      }
    };
  }, [query.length, showDropdown, focused]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle city selection
  const handleSelect = async (city: CitySuggestion) => {
    setIsAdding(city.id);

    try {
      setIsLoading(true);
      const weatherData = await fetchWeather({
        id: city.id,
        lat: Number(city.lat),
        lon: Number(city.lon),
        unit: 'metric'
      });

      addCity(weatherData);
      showToast({
        message: 'toasts.added',
        values: { city: city.city[locale] || city.city.en },
        type: 'success',
      });

      // Clear search after adding
      setTimeout(clearSearch, 300);
      onSelect();
    } catch {
      showToast({
        message: 'errors.fetchWeather',
        type: 'error'
      });
    } finally {
      setIsAdding(null);
      setIsLoading(false);
    }
  };

  // Clear search input
  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setHasSearched(false);
    setSelectedIndex(-1);
    setShowDropdown(false);
    inputRef.current?.blur();
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        clearSearch();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-grow">
          <Input
            ref={inputRef}
            type="text"
            value={query}
            data-testid="city-search-input"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!focused) setFocused(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={t('search.placeholder')}
            aria-label={t('search.placeholder')}
            className={cn(
              "flex-grow h-12 !text-lg shadow-sm transition-all",
              "focus-visible:ring-primary/30 focus-visible:ring-2",
              "border-2 focus-visible:border-primary/50",
              direction === 'rtl' ? 'text-right pr-12 pl-8' : 'text-left pl-12 pr-8'
            )}
          />
          <div className={cn(
            "absolute top-1/2 transform -translate-y-1/2 transition-all duration-200",
            direction === 'ltr' ? 'right-3' : 'left-3'
          )}>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" role="status">
                <span className="sr-only">{t('search.loading')}</span>
              </Loader2>
            ) : (
              <Search className="h-5 w-5 text-muted-foreground">
                <span className="sr-only">{t('search.search')}</span>
              </Search>
            )}
          </div>
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 text-muted-foreground",
                direction === 'ltr' ? 'left-3' : 'right-3'
              )}
              title={t('search.clear')}
              aria-label={t('search.clear')}
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" role="presentation">
                <span className="sr-only">{t('search.clear')}</span>
              </X>
            </button>
          )}
        </div>
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="mt-2 w-full border rounded-lg shadow-lg bg-card/98 backdrop-blur-sm border-border/50 animate-in fade-in-0 zoom-in-95 duration-200">
          <Suspense fallback={
            <div className="p-6 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" role="status">
                <span className="sr-only">{t('search.loading')}</span>
              </Loader2>
              <p className="text-sm text-muted-foreground font-medium">
                {t('search.searching')}
              </p>
            </div>
          }>
            <SuggestionsList
              suggestions={suggestions}
              loading={loading}
              hasSearched={hasSearched}
              selectedIndex={selectedIndex}
              isAdding={isAdding}
              handleSelect={handleSelect}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}