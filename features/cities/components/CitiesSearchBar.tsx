'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useWeatherStore } from '@/store/useWeatherStore';
import { AppLocale } from '@/types/i18n';
import { getDirection } from '@/lib/intl';
import { cn } from '@/lib/utils';
import { CityWeather } from '@/types/weather';

interface CitiesSearchBarProps {
  onFilter: (filteredCities: CityWeather[], isSearching: boolean) => void;
  placeholder?: string;
  className?: string;
}

export default function CitiesSearchBar({ 
  onFilter, 
  placeholder, 
  className 
}: CitiesSearchBarProps) {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const direction = getDirection(locale);
  
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const cities = useWeatherStore((s) => s.cities);

  // Filter cities based on search query
  useEffect(() => {
    if (!query.trim()) {
      onFilter(cities, false);
      return;
    }

    const filteredCities = cities.filter(city => {
      const cityName = city.name[locale]?.toLowerCase() || city.name.en?.toLowerCase() || '';
      const countryName = city.country[locale]?.toLowerCase() || city.country.en?.toLowerCase() || '';
      const searchTerm = query.toLowerCase().trim();
      
      return cityName.includes(searchTerm) || countryName.includes(searchTerm);
    });

    onFilter(filteredCities, true);
  }, [query, cities, locale, onFilter]);

  const clearSearch = () => {
    setQuery('');
    setFocused(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      clearSearch();
    }
  };

  return (
    <div className={`relative w-full ${className || ''}`} dir={direction}>
      <div className="flex items-center gap-2">
        <div className="relative flex-grow">
          <Input
            ref={inputRef}
            type="text"
            value={query}
            data-testid="cities-search-input"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!focused) setFocused(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || t('cities.searchPlaceholder')}
            aria-label={placeholder || t('cities.searchPlaceholder')}
            className={cn(
              "w-full h-12 !text-lg shadow-sm transition-all rounded-2xl",
              "bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/10",
              "focus-visible:ring-sky-500/30 focus-visible:ring-2",
              "focus-visible:border-sky-500/50",
              direction === 'rtl' ? 'text-right pl-12 pr-8' : 'text-left pl-12 pr-8'
            )}
          />
          
          {/* Search Icon */}
          <div className={cn(
            "absolute top-1/2 transform -translate-y-1/2 transition-all duration-200",
            direction === 'rtl' ? 'right-3' : 'left-3'
          )}>
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          
          {/* Clear Button */}
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
    </div>
  );
}
