'use client';

import { useTranslations } from 'next-intl';
import { Suspense, useState, useCallback } from 'react';
import { CitiesGrid, CitiesSearchBar } from '@/features/cities';
import { Skeleton } from '@/components/ui/skeleton';
import { CityWeather } from '@/types/weather';

export default function CitiesPage() {
  const t = useTranslations();
  const [filteredCities, setFilteredCities] = useState<CityWeather[] | undefined>(undefined);
  const [isSearching, setIsSearching] = useState(false);

  const handleFilter = useCallback((cities: CityWeather[], isSearching: boolean) => {
    setFilteredCities(cities);
    setIsSearching(isSearching);
  }, []);

  return (
    <div className="h-full bg-gradient-to-b from-blue-50 to-white dark:from-[#0d1117] dark:to-[#1b1f24] overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <h1 className="text-2xl font-semibold text-neutral-800 dark:text-white/90">
          {t('navigation.cities')}
        </h1>
      </div>

      <div className="px-6 pb-12 space-y-6">
        {/* Cities Search Bar */}
        <div className="relative">
          <Suspense fallback={<Skeleton className="h-12 w-full rounded-xl" />}>
            <CitiesSearchBar onFilter={handleFilter} />
          </Suspense>
        </div>

        {/* Cities Grid */}
        <div>
          <h2 className="text-lg font-semibold text-neutral-800 dark:text-white/90 mt-6 mb-2">
            {t('cities.savedCities')}
          </h2>
          <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
            <CitiesGrid filteredCities={filteredCities} isSearching={isSearching} />
          </Suspense>
        </div>

      </div>
    </div>
  );
}