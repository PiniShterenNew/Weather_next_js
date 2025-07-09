'use client';

import { CheckCircle, Loader2, Plus } from 'lucide-react';
import { useWeatherStore } from '@/stores/useWeatherStore';
import { CitySuggestion } from '@/types/suggestion';
import { cn } from '@/lib/utils';
import { useLocale } from 'next-intl';
import { AppLocale } from '@/types/i18n';

interface SuggestionItemProps {
  city: CitySuggestion;
  index: number;
  selectedIndex: number;
  isAdding: string | null;
  handleSelect: (city: CitySuggestion) => void;
}

/**
 * Individual suggestion item component
 * Displays city information and handles selection
 */
export function SuggestionItem({
  city,
  index,
  selectedIndex,
  isAdding,
  handleSelect
}: SuggestionItemProps) {
  const locale = useLocale() as AppLocale;
  const cities = useWeatherStore((s) => s.cities);

  const isSelected = index === selectedIndex;
  const isCurrentlyAdding = isAdding === city.id;
  const isCityAlreadyAdded = cities.some(c => c.id === city.id);

  // Get localized city and country names
  const cityName = locale === 'he' ? city.city.he : city.city.en;
  const countryName = locale === 'he' ? city.country.he : city.country.en;

  return (
    <div
      onClick={() => {
        if (!isCityAlreadyAdded && !isCurrentlyAdding) {
          handleSelect(city);
        }
      }}
      className={cn(
        "px-3 py-2 flex items-center gap-3 transition-colors cursor-pointer",
        isSelected && "bg-muted",
        isCityAlreadyAdded && "opacity-50 cursor-not-allowed",
        !isSelected && !isCurrentlyAdding && "hover:bg-muted/50",
        isCurrentlyAdding && "bg-green-50 cursor-not-allowed"
      )}
    >
      <div className={cn(
        "shrink-0 flex items-center justify-center rounded-md shadow-sm h-8 w-8 transition-all",
        isCurrentlyAdding ? "bg-green-100" : "bg-muted"
      )}>
        {isCurrentlyAdding ? (
          <Loader2 data-testid="suggestion-loader" className="h-4 w-4 animate-spin text-green-600" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
      </div>

      <div className="flex flex-col overflow-hidden flex-1">
        <span className="font-medium text-sm truncate">
          {cityName}
        </span>
        <span className="text-muted-foreground text-xs truncate">
          {countryName}
        </span>
      </div>

      {isCurrentlyAdding && (
        <CheckCircle data-testid="suggestion-check" className="h-4 w-4 text-green-600 animate-pulse" />
      )}
    </div>
  );
}
