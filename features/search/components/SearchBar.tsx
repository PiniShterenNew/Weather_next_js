'use client';

import React from 'react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { fetchWeather } from '@/features/weather';
import { useWeatherStore } from '@/store/useWeatherStore';
import { Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { CitySuggestion } from '@/types/suggestion';
import { useDebounce } from '@/hooks/useDebounce';
import { AppLocale } from '@/types/i18n';
import { getDirection } from '@/lib/intl';
import { cn } from '@/lib/utils';
import { SuggestionsList } from './SuggestionsList';
import SearchInput from './SearchInput';
import { useSearchKeyboard } from '../hooks/useSearchKeyboard';
import { useSearchSuggestions } from '../hooks/useSearchSuggestions';
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

  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [focused, setFocused] = useState(false);

  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const addCity = useWeatherStore((s) => s.addCity);
  const showToast = useWeatherStore((s) => s.showToast);
  const setIsLoading = useWeatherStore((s) => s.setIsLoading);

  const { suggestions, loading, hasSearched } = useSearchSuggestions(debouncedQuery, locale);
  const { selectedIndex, handleKeyDown: handleKeyboardKeyDown, setSelectedIndex } = useSearchKeyboard();

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

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions, setSelectedIndex]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    handleKeyboardKeyDown(e, suggestions, handleSelect, inputRef, showDropdown, setShowDropdown);
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

      const wasAdded = await addCity(weatherData);
      
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
  const clearSearch = useCallback(() => {
    setQuery('');
    setSelectedIndex(-1);
    setShowDropdown(false);
    inputRef.current?.blur();
  }, [setSelectedIndex]);

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
  }, [clearSearch]);

  return (
    <div className={`relative w-full ${className || ''}`} dir={direction}>
      <div className="flex items-center gap-2">
        <SearchInput
          ref={inputRef}
          query={query}
          loading={loading}
          direction={direction}
          placeholder={placeholder}
          onQueryChange={setQuery}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          onClear={clearSearch}
        />
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className={cn(
            "absolute top-full mt-2 w-full z-[9999] border rounded-2xl shadow-2xl bg-card backdrop-blur-md border-border animate-in fade-in-0 zoom-in-95 duration-200",
            direction === 'rtl' ? 'right-0' : 'left-0'
          )}
        >
          <SuggestionsList
            suggestions={suggestions}
            loading={loading}
            hasSearched={hasSearched}
            selectedIndex={selectedIndex}
            isAdding={isAdding}
            handleSelect={handleSelect}
            className="p-1"
            direction={direction}
          />
        </div>
      )}
    </div>
  );
}
