'use client';

import { useMemo, useState } from 'react';
import { Globe, Loader2, Plus } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { POPULAR_CITIES } from '@/constants/popularCities';
import { useRouter, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import type { AppLocale } from '@/types/i18n';
import type { TemporaryUnit } from '@/types/ui';
import { useWeatherStore } from '@/store/useWeatherStore';
import { fetchWeather } from '@/features/weather';

interface PopularCitiesProps {
  direction: 'ltr' | 'rtl';
  color?: 'primary' | 'default';
  onCityAdded?: () => void;
}

const INITIAL_LOAD = 12;
const LOAD_MORE_COUNT = 8;

const PopularCities = ({ direction, color = 'default', onCityAdded }: PopularCitiesProps) => {
  const { addCity, cities, unit, showToast, setIsLoading, setOpen } = useWeatherStore((state) => ({
    addCity: state.addCity,
    cities: state.cities,
    unit: state.unit,
    showToast: state.showToast,
    setIsLoading: state.setIsLoading,
    setOpen: state.setOpen,
  }));
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale() as AppLocale;
  const t = useTranslations();
  const isAddCityPage = pathname === '/add-city';

  const [displayCount, setDisplayCount] = useState(INITIAL_LOAD);
  const [loadingCityId, setLoadingCityId] = useState<string | null>(null);

  const filteredCities = useMemo(
    () => POPULAR_CITIES.filter((city) => !cities.some((existing) => existing.id === city.id)),
    [cities],
  );

  const handleAddCity = async (city: (typeof POPULAR_CITIES)[number]) => {
    setLoadingCityId(city.id);
    setIsLoading(true);

    try {
      const weatherData = await fetchWeather({
        ...city,
        unit: unit as TemporaryUnit,
      });

      const wasAdded = await addCity({
        ...weatherData,
        lastUpdated: Date.now(),
      });

      if (wasAdded) {
        showToast({ message: 'toasts.added', type: 'success', values: { city: city.city[locale] } });

        if (isAddCityPage) {
          router.push('/');
        }

        setOpen(false);
        onCityAdded?.();
      }
    } catch {
      showToast({ message: 'toasts.error', type: 'error' });
    } finally {
      setLoadingCityId(null);
      setIsLoading(false);
    }
  };

  if (filteredCities.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/60 p-4 text-muted-foreground shadow-sm backdrop-blur-md dark:bg-white/5">
        <Globe className="mx-auto mb-4 h-12 w-12 opacity-50" role="presentation" />
        <p className="text-center">{t('search.allCitiesAdded')}</p>
      </div>
    );
  }

  const visibleCities = filteredCities.slice(0, displayCount);
  const hasMoreCities = displayCount < filteredCities.length;

  return (
    <section
      className="space-y-3 rounded-xl border border-white/10 bg-white/70 p-4 shadow-sm backdrop-blur-md dark:bg-white/5 sm:p-5"
      dir={direction}
      aria-live="polite"
    >
      <ul className="space-y-2" role="listbox" aria-label={t('search.popularCities')}>
        {visibleCities.map((city) => {
          const isLoading = loadingCityId === city.id;

          return (
            <li key={city.id} role="option" aria-selected={false}>
              <button
                type="button"
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60',
                  direction === 'rtl' ? 'text-right' : 'text-left',
                  color === 'primary'
                    ? 'bg-brand-500/10 text-brand-900 hover:bg-brand-500/20 dark:text-white'
                    : 'text-neutral-800 hover:bg-white/60 dark:text-white/90 dark:hover:bg-white/10'
                )}
                onClick={() => handleAddCity(city)}
                disabled={isLoading}
                aria-busy={isLoading}
                aria-label={city.city[locale]}
              >
                <div className="flex flex-col">
                  <span className="text-base font-medium">{city.city[locale]}</span>
                  <span className="text-xs text-muted-foreground">
                    {t('popular.title')} • {city.country[locale] ?? city.country.en}
                  </span>
                </div>
                <div className="ml-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-white/70 text-brand-700 dark:border-white/10 dark:bg-white/5 dark:text-white">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span className="sr-only">
                    {isLoading ? t('search.loading') : t('search.addCity')}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {hasMoreCities ? (
        <div className="border-t border-white/20 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDisplayCount((previous) => Math.min(previous + LOAD_MORE_COUNT, filteredCities.length))}
            className="w-full justify-center text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-800 dark:text-white/70 dark:hover:text-white/90"
            disabled={!!loadingCityId}
          >
            {t('common.loadMore')} ({filteredCities.length - displayCount})
          </Button>
        </div>
      ) : null}

      <p className="sr-only" role="status" aria-live="polite">
        {loadingCityId
          ? `${t('search.loading')} ${filteredCities.find((c) => c.id === loadingCityId)?.city[locale] ?? ''}`
          : t('search.searchResults')}
      </p>
    </section>
  );
};

export default PopularCities;


