'use client';

import React from 'react';
import { useEffect, useState, useRef, Suspense } from 'react';
import { fetchSuggestions, fetchWeather } from '@/features/weather';
import { useWeatherStore } from '@/store/useWeatherStore';
import { Input } from '@/components/ui/input';
import { Search, X, Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { CitySuggestion } from '@/types/suggestion';
import { useDebounce } from '@/lib/useDebounce';
import { AppLocale } from '@/types/i18n';
import { getDirection } from '@/lib/intl';
import { cn } from '@/lib/utils';
import { SuggestionsList } from './SuggestionsList';
import { SearchBarProps } from '../types';

/**
 * SearchBar component with autocomplete functionality
 * Uses Suspense for improved loading experience
 */
export default function SearchBar({ onSelect, placeholder, className }: SearchBarProps) {
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
  }, [debouncedQuery, locale]); // Remove loading dependency to prevent infinite loop

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
    const currentCityId = city.id;
    setIsAdding(currentCityId);

    try {
      setIsLoading(true);
      
      // Add timeout to prevent infinite loading
      const weatherDataPromise = fetchWeather({
        id: city.id,
        lat: Number(city.lat),
        lon: Number(city.lon),
        unit: 'metric'
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Weather fetch timeout'));
        }, 15000); // 15 second timeout
      });

      const weatherData = await Promise.race([
        weatherDataPromise,
        timeoutPromise
      ]);

      const wasAdded = addCity(weatherData);
      
      // Only show success toast if city was actually added
      if (wasAdded) {
        showToast({
          message: 'toasts.added',
          values: { city: city.city[locale] || city.city.en },
          type: 'success',
        });
        
        // Navigate immediately after successful addition
        onSelect();
        
        // Clear search after navigation
        setTimeout(clearSearch, 100);
      } else {
        // City already exists
        showToast({
          message: 'toasts.exists',
          values: { city: city.city[locale] || city.city.en },
          type: 'info',
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error adding city:', error);
      
      // Check if it's a timeout or network error
      const isTimeout = error instanceof Error && error.message.includes('timeout');
      const isNetworkError = error instanceof TypeError || 
                           (error instanceof Error && error.message.includes('fetch'));
      
      if (isTimeout || isNetworkError) {
        showToast({
          message: 'errors.networkError',
          type: 'error'
        });
      } else {
        showToast({
          message: 'errors.fetchWeather',
          type: 'error'
        });
      }
    } finally {
      // Always reset loading states - check if this is still the current city being added
      if (isAdding === currentCityId) {
        setIsAdding(null);
      }
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
    <div className={`relative w-full ${className || ''}`} dir={direction}>
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
              onClick={clearSearch}
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
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className={cn(
            "absolute top-full mt-2 w-full z-[9999] border rounded-lg shadow-2xl bg-card backdrop-blur-md border-border animate-in fade-in-0 zoom-in-95 duration-200",
            direction === 'rtl' ? 'right-0' : 'left-0'
          )}
        >
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
