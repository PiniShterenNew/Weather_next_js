'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { MapPin, Star } from 'lucide-react';
import { Suspense } from 'react';
import { SearchBar, RecentSearches } from '@/features/search';
import PopularCities from '@/components/QuickAdd/PopularCities';
import AddLocation from '@/components/QuickAdd/AddLocation';
import { getDirection } from '@/lib/intl';
import { AppLocale } from '@/types/i18n';
import { Skeleton } from '@/components/ui/skeleton';
import { useWeatherStore } from '@/store/useWeatherStore';

export default function AddCityPage() {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const direction = getDirection(locale);
  const { cities } = useWeatherStore();
  
  // Show add location button only if there's no current location city in the list
  const hasCurrentLocationCity = cities.some(city => city.isCurrentLocation === true);
  const showAddLocation = !hasCurrentLocationCity;

  const handleCitySelect = () => {
    // Navigate back to weather page after city selection
    router.push(`/${locale}`);
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white dark:from-[#0d1117] dark:to-[#1b1f24]">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-white/90 flex items-center gap-3">
          <MapPin className="h-6 w-6 text-sky-500 dark:text-blue-400" />
          {t('search.addCity')}
        </h1>
      </div>

      <div className="px-6 pb-32 space-y-6 max-w-md mx-auto">
        {/* Search Input */}
        <div className="relative">
          <Suspense fallback={<Skeleton className="h-12 w-full rounded-lg" />}>
            <SearchBar
              onSelect={handleCitySelect}
            />
          </Suspense>
        </div>

        {/* Add Current Location Button */}
        {showAddLocation && (
          <div className="flex justify-center">
            <AddLocation size="lg" type="default" dataTestid="add-location-page" />
          </div>
        )}

        {/* Recent Searches */}
        <Suspense fallback={<Skeleton className="h-32 w-full rounded-lg" />}>
          <RecentSearches
            onSelect={handleCitySelect}
          />
        </Suspense>

        {/* Popular Cities */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-neutral-800 dark:text-white/90 flex items-center gap-3">
            <Star className="h-5 w-5 text-sky-500 dark:text-blue-400" />
            {t('search.popularCities')}
          </h3>
          <Suspense fallback={<Skeleton className="h-48 w-full rounded-lg" />}>
            <PopularCities direction={direction} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
