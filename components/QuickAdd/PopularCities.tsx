'use client';

import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { POPULAR_CITIES } from '@/constants/popularCities';
import { useWeatherStore } from '@/store/useWeatherStore';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { AppLocale } from '@/types/i18n';
import { TemporaryUnit } from '@/types/ui';
import { fetchWeather } from '@/features/weather';
import { useTranslations } from 'next-intl';

type CityListAddProps = {
    direction: 'ltr' | 'rtl';
    _color?: 'primary' | 'default';
}

const INITIAL_LOAD = 12;
const LOAD_MORE_COUNT = 8;

export default function PopularCities({ direction, _color = 'default' }: CityListAddProps) {
    const { addCity, cities, unit, showToast, setIsLoading, setOpen } = useWeatherStore();
    const router = useRouter();
    const pathname = usePathname();
    const locale = useLocale() as AppLocale;
    const t = useTranslations();
    const isAddCityPage = pathname === '/add-city';
    
    const [displayCount, setDisplayCount] = useState(INITIAL_LOAD);
    const [loadingCityId, setLoadingCityId] = useState<string | null>(null);

    const filteredCities = POPULAR_CITIES.filter(city =>
        !cities.some(c => c.lat === city.lat && c.lon === city.lon)
    );

    const handleAddCity = async (city: typeof POPULAR_CITIES[number]) => {
        setLoadingCityId(city.id);
        setIsLoading(true);
        try {
            const cityName = city.city[locale];

            const weatherData = await fetchWeather({
                ...city,
                unit: unit as TemporaryUnit,
            });

            const wasAdded = addCity({
                ...weatherData,
                lastUpdated: Date.now()
            });
            
            // Only show success toast and navigate if city was actually added
            if (wasAdded) {
                showToast({ message: 'toasts.added', type: 'success', values: { city: cityName } });
                
                // Navigate to home page if on add-city page
                if (isAddCityPage) {
                    router.push('/');
                }
                
                setOpen(false);
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
            <div className="py-8 text-center text-muted-foreground">
                <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" role="presentation" />
                <p>{t('search.allCitiesAdded')}</p>
            </div>
        );
    }

    // Cities to display (with pagination)
    const displayCities = filteredCities.slice(0, displayCount);
    const hasMoreCities = displayCount < filteredCities.length;

    const handleLoadMore = () => {
        setDisplayCount(prev => Math.min(prev + LOAD_MORE_COUNT, filteredCities.length));
    };

    return (
        <div className="space-y-3 bg-white/60 dark:bg-white/5 backdrop-blur-md shadow-sm border-white/10 rounded-2xl p-4" dir={direction}>
            <div className="space-y-2">
                {displayCities.map((city) => {
                    const isLoading = loadingCityId === city.id;
                    return (
                        <button
                            key={`${city.id}-${city.country}`}
                            className={`w-full py-2 px-3 hover:bg-white/40 dark:hover:bg-white/10 rounded-xl transition-colors ${direction === 'rtl' ? 'text-right' : 'text-left'} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between`}
                            onClick={() => handleAddCity(city)}
                            disabled={isLoading}
                        >
                            <div className="text-base font-normal text-neutral-800 dark:text-white/90">
                                {city.city[locale]}
                            </div>
                            {isLoading && (
                                <div className="h-4 w-4 animate-spin rounded-full border border-current border-t-transparent" />
                            )}
                        </button>
                    );
                })}
            </div>
            
            {hasMoreCities && (
                <div className="pt-2 border-t border-white/10">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLoadMore}
                        className="w-full text-neutral-600 dark:text-white/70 hover:text-neutral-800 dark:hover:text-white/90"
                    >
                        {t('common.loadMore')} ({filteredCities.length - displayCount})
                    </Button>
                </div>
            )}
        </div>
    );
}