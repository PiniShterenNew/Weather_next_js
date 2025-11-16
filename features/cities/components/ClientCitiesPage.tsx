'use client';

import { useTranslations } from 'next-intl';
import { useState, useCallback } from 'react';
import CitiesGrid from '@/features/cities/components/CitiesGrid';
import CitiesSearchBar from '@/features/cities/components/CitiesSearchBar';
import { CityWeather } from '@/types/weather';

interface ClientCitiesPageProps {
  locale: string;
}

export default function ClientCitiesPage({ locale }: ClientCitiesPageProps) {
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
        <div className="w-full max-w-3xl mx-auto">
          <h1 className="text-2xl font-semibold text-neutral-800 dark:text-white/90">
            {t('navigation.cities')}
          </h1>
        </div>
      </div>

      <div className="px-6 pb-12 space-y-6 w-full max-w-3xl mx-auto">
        {/* Cities Search Bar */}
        <div className="relative">
          <CitiesSearchBar onFilter={handleFilter} />
        </div>

        {/* Cities Grid */}
        <div>
          <h2 className="text-lg font-semibold text-neutral-800 dark:text-white/90 mt-6 mb-2">
            {t('cities.savedCities')}
          </h2>
          <CitiesGrid filteredCities={filteredCities} isSearching={isSearching} />
        </div>

      </div>
    </div>
  );
}

