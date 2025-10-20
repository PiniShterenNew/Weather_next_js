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
    <div className={`space-y-3 ${className}`} dir={direction}>
      <h3 className="text-lg font-medium text-neutral-800 dark:text-white/90 flex items-center gap-3">
        <Clock className="h-5 w-5 text-sky-500 dark:text-blue-400" />
        {t('search.recentSearches')}
      </h3>

      <div className="space-y-2 bg-white/60 dark:bg-white/5 backdrop-blur-md shadow-sm border-white/10 rounded-2xl p-4">
        {recentSearches.map((city) => (
          <button
            key={`${city.name}-${city.country}`}
            className={cn(
              "w-full py-2 px-3 hover:bg-white/40 dark:hover:bg-white/10 rounded-xl transition-colors",
              direction === 'rtl' ? 'text-right' : 'text-left'
            )}
            onClick={() => onSelect(city)}
          >
            <div className="text-base font-normal text-neutral-800 dark:text-white/90">
              {city.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

