'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { SearchBar, RecentSearches } from '@/features/search';
import AddLocation from '@/features/search/components/quickAdd/AddLocation';
import { AppLocale } from '@/types/i18n';
import { useWeatherStore } from '@/store/useWeatherStore';
import CitiesSuggestions from '@/features/search/components/CitiesSuggestions';

interface ClientAddCityPageProps {
  locale: string;
}

export default function ClientAddCityPage({ locale }: ClientAddCityPageProps) {
  const t = useTranslations();
  const appLocale = useLocale() as AppLocale;
  const router = useRouter();
  const { cities, autoLocationCityId } = useWeatherStore();
  
  // Show add location button only if there's no current location city in the list
  // Check both isCurrentLocation flag and autoLocationCityId to be safe
  const hasCurrentLocationCity = autoLocationCityId !== undefined || cities.some(city => city.isCurrentLocation === true);
  const showAddLocation = !hasCurrentLocationCity;

  const handleCitySelect = () => {
    // Navigate back to weather page after city selection
    router.push(`/${appLocale}`);
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white dark:from-[#0d1117] dark:to-[#1b1f24] overflow-x-hidden overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4 w-full">
        <div className="w-full max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-neutral-800 dark:text-white/90 flex items-center gap-3">
            <MapPin className="h-6 w-6 text-sky-500 dark:text-blue-400" />
            {t('search.addCity')}
          </h1>
        </div>
      </div>

      <div className="px-6 space-y-6 w-full max-w-3xl mx-auto">
        {/* Search Input */}
        <div className="relative">
          <SearchBar
            onSelect={handleCitySelect}
          />
        </div>

        {/* Add Current Location Button */}
        {showAddLocation && (
          <div className="flex justify-center">
            <AddLocation size="lg" type="default" dataTestId="add-location-page" />
          </div>
        )}

        {/* Recent Searches */}
        <RecentSearches
          onSelect={handleCitySelect}
        />

        {/* Popular Cities - unified with home empty state */}
        <CitiesSuggestions />
      </div>
    </div>
  );
}

