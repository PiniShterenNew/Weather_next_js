'use client';

import { Dialog, DialogContent, DialogTitle, VisuallyHidden } from '@/components/ui/dialog';
import { useWeatherStore } from '@/store/useWeatherStore';
import { useTranslations, useLocale } from 'next-intl';
import { X } from 'lucide-react';
import { SearchBar, RecentSearches } from '@/features/search';
import PopularCities from '@/components/QuickAdd/PopularCities';
import { Button } from '@/components/ui/button';
import { getDirection } from '@/lib/intl';
import { AppLocale } from '@/types/i18n';

export function QuickCityAddModal() {
  const t = useTranslations();
  const { open, setOpen } = useWeatherStore();
  const locale = useLocale() as AppLocale;
  const direction = getDirection(locale);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md max-h-[90vh] p-0 bg-white dark:bg-gray-900 rounded-none" dir={direction}>
        <VisuallyHidden>
          <DialogTitle>Weather</DialogTitle>
        </VisuallyHidden>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Weather
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="h-8 w-8 text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="px-6 pb-6 space-y-6">
          {/* Search Input */}
          <div className="relative">
            <SearchBar
              onSelect={() => {
                setOpen(false);
              }}
            />
          </div>

          {/* Recent Searches */}
          <RecentSearches
            onSelect={() => {
              setOpen(false);
            }}
          />

          {/* Popular Cities */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('search.popularCities')}
            </h3>
            <PopularCities direction={direction} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}