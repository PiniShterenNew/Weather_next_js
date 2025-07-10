'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Building2, Globe, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { POPULAR_CITIES } from '@/constants/popularCities';
import { useWeatherStore } from '@/stores/useWeatherStore';
import { useLocale } from 'next-intl';
import { AppLocale } from '@/types/i18n';
import { TemporaryUnit } from '@/types/ui';
import { fetchWeather } from '@/features/weather';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

type CityListAddProps = {
    direction: 'ltr' | 'rtl';
    color?: 'primary' | 'default';
}

// Helper function to get current time in city
const getCityTime = (timezoneOffsetSeconds: number) => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const cityTime = new Date(utc + (timezoneOffsetSeconds * 1000));
    return cityTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Group cities by continent
const groupCitiesByContinent = (cities: typeof POPULAR_CITIES) => {
    return cities.reduce((acc, city) => {
        if (!acc[city.continent]) {
            acc[city.continent] = [];
        }
        acc[city.continent].push(city);
        return acc;
    }, {} as Record<string, typeof POPULAR_CITIES>);
};

// Continent display names
const continentNames = {
    'North America': { en: 'North America', he: 'צפון אמריקה' },
    'South America': { en: 'South America', he: 'דרום אמריקה' },
    'Europe': { en: 'Europe', he: 'אירופה' },
    'Asia': { en: 'Asia', he: 'אסיה' },
    'Africa': { en: 'Africa', he: 'אפריקה' },
    'Oceania': { en: 'Oceania', he: 'אוקיאניה' }
};

export default function PopularCities({ direction, color = 'default' }: CityListAddProps) {
    const { addCity, cities, unit, showToast, setIsLoading, setOpen, maxCities } = useWeatherStore();
    const locale = useLocale() as AppLocale;
    const t = useTranslations();
    const [expandedContinents, setExpandedContinents] = useState<Record<string, boolean>>({});
    const [currentTimes, setCurrentTimes] = useState<Record<string, string>>({});

    // Update times every minute
    useEffect(() => {
        const updateTimes = () => {
            const times: Record<string, string> = {};
            POPULAR_CITIES.forEach(city => {
                times[city.id] = getCityTime(city.timezoneOffsetSeconds);
            });
            setCurrentTimes(times);
        };

        updateTimes();
        const interval = setInterval(updateTimes, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    // Initialize expanded continents
    useEffect(() => {
        const initialExpanded: Record<string, boolean> = {};
        Object.keys(groupCitiesByContinent(POPULAR_CITIES)).forEach(continent => {
            initialExpanded[continent] = false; // Start with all expanded
        });
        setExpandedContinents(initialExpanded);
    }, []);

    const filteredCities = POPULAR_CITIES.filter(city =>
        !cities.some(c => c.lat === city.lat && c.lon === city.lon)
    );

    const groupedCities = groupCitiesByContinent(filteredCities);

    const handleAddCity = async (city: typeof POPULAR_CITIES[number]) => {
        setIsLoading(true);
        try {
            const cityName = city.city[locale];

            const cityExists = cities.some(c =>
                (c.lat === city.lat && c.lon === city.lon)
            );

            if (cityExists) {
                showToast({ message: 'toasts.exists', type: 'info', values: { name: cityName } });
                return;
            }

            if (cities.length == maxCities) {
                showToast({
                    message: 'toasts.maxCities',
                    type: 'warning',
                    values: { maxCities: maxCities.toString() }
                });
                return;
            }

            const weatherData = await fetchWeather({
                ...city,
                unit: unit as TemporaryUnit,
            });

            addCity({ ...weatherData, lastUpdated: Date.now() });
            showToast({ message: 'toasts.added', type: 'success', values: { name: cityName } });
        } catch {
            showToast({ message: 'toasts.error', type: 'error' });
        } finally {
            setIsLoading(false);
            setOpen(false);
        }
    };

    const toggleContinent = (continent: string) => {
        setExpandedContinents(prev => ({
            ...prev,
            [continent]: !prev[continent]
        }));
    };

    if (Object.keys(groupedCities).length === 0) {
        return (
            <div className="py-8 text-center text-muted-foreground">
                <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" role="presentation" />
                <p>{t('search.allCitiesAdded')}</p>
            </div>
        );
    }

    return (
        <div
            dir={direction}
            className="overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent pr-2 max-h-96"
        >
            <div className="space-y-4 p-2">
                {Object.entries(groupedCities).map(([continent, continentCities]) => (
                    <div key={continent.replace(/\s+/g, '_')} className="bg-card/50 rounded-lg border border-muted/50">
                        {/* Continent Header */}
                        <button
                            onClick={() => toggleContinent(continent)}
                            role="button"
                            name={continent}
                            className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-t-lg"
                        >
                            <div className="flex items-center gap-3">
                                <Globe className={cn("h-5 w-5", color === "primary" ? "text-primary" : "text-muted-foreground")} role="presentation"/>
                                <h3 className="font-semibold text-sm">
                                    {continentNames[continent as keyof typeof continentNames]?.[locale] || continent}
                                </h3>
                                <span className="text-xs text-muted-foreground bg-muted w-6 h-6 flex items-center justify-center rounded-full">
                                    {continentCities.length}
                                </span>
                            </div>
                            {expandedContinents[continent] ?
                                <ChevronUp className="h-4 w-4 text-muted-foreground" role="presentation" /> :
                                <ChevronDown className="h-4 w-4 text-muted-foreground" role="presentation" />
                            }
                        </button>

                        {/* Cities Grid */}
                        {expandedContinents[continent] && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 pt-0 mt-3">
                                {continentCities.map((city) => (
                                    <Button
                                        key={`${city.id}-${city.country}`}
                                        variant="outline"
                                        size="default"
                                        className="h-auto p-4 flex flex-col items-start justify-start gap-2 hover:bg-primary/10 transition-colors border-muted/50 bg-background/50"
                                        onClick={() => handleAddCity(city)}
                                    >
                                        <div className="flex items-center gap-3 w-full">
                                            <Building2 className={cn("h-5 w-5 shrink-0", color === "primary" && "text-primary")} role="presentation" />
                                            <div className={cn("flex flex-col items-start min-w-0 flex-1", color === "primary" && "text-primary")}>
                                                <span className="font-medium truncate w-full text-right" dir={direction}>
                                                    {city.city[locale]}
                                                </span>
                                                <span className="text-xs text-muted-foreground truncate w-full text-right" dir={direction}>
                                                    {city.country[locale]}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Local Time */}
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground w-full justify-start">
                                            <Clock className="h-3 w-3" role="presentation" />
                                            <span>
                                                {currentTimes[city.id] || getCityTime(city.timezoneOffsetSeconds)}
                                            </span>
                                            <span className="text-xs opacity-75">
                                                Local
                                            </span>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}