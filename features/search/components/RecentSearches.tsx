'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Clock } from 'lucide-react';
import { AppLocale } from '@/types/i18n';
import { getDirection } from '@/lib/intl';
import { cn } from '@/lib/utils';
import { useRecentSearchesStore } from '@/store/useRecentSearchesStore';

interface City {
  name: string;
  country: string;
  temp?: string;
}

interface RecentSearchesProps {
  onSelect: (city: City) => void;
  className?: string;
}

export function RecentSearches({ onSelect, className = '' }: RecentSearchesProps) {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const direction = getDirection(locale);
  const { searches: recentSearches } = useRecentSearchesStore();

  if (recentSearches.length === 0) return null;

  return (
    <section className={cn('space-y-3', className)} dir={direction} aria-labelledby="recent-searches-heading">
      <h3
        id="recent-searches-heading"
        className="flex items-center gap-2 text-base font-semibold text-neutral-800 dark:text-white/90 sm:text-lg"
      >
        <Clock className="h-5 w-5 text-sky-500 dark:text-blue-400" aria-hidden="true" />
        {t('search.recentSearches')}
      </h3>

      <ul
        className="space-y-1 rounded-xl border border-white/10 bg-white/70 p-3 shadow-sm backdrop-blur-md dark:bg-white/5 sm:p-4"
        aria-live="polite"
      >
        {recentSearches.map((city) => (
          <li key={`${city.name}-${city.country}`}>
            <button
              type="button"
              className={cn(
                'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:text-white/90',
                direction === 'rtl' ? 'text-right' : 'text-left',
                'hover:bg-white/60 dark:hover:bg-white/10'
              )}
              onClick={() => onSelect(city)}
              aria-label={`${city.name}`}
            >
              <span className="truncate text-base font-medium">{city.name}</span>
              {city.temp ? (
                <span className="text-sm text-muted-foreground" aria-hidden="true">
                  {city.temp}
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

