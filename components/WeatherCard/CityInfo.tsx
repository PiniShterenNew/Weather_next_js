import { CityWeather } from "@/types/weather";
import React, { useCallback, useEffect, useState } from "react";
import { formatPressure, formatTemperatureWithConversion, formatTimeWithOffset, formatVisibility, formatWindSpeed, getWindDirection, isSameTimezone } from "../../lib/helpers";
import { Droplets, Wind, Gauge, Eye, Cloud, Sun, Sunrise, Sunset } from "lucide-react";
import { useTranslations } from "next-intl";
import { useWeatherStore } from "@/stores/useWeatherStore";
import { WeatherIcon } from "./WeatherIcon";
import WeatherTimeNow from "./WeatherTimeNow";
import { Button } from "@/components/ui/button";
import {
    Loader2,
    RotateCcw,
    Trash,
    LocateFixed,
} from 'lucide-react';
import dynamic from "next/dynamic";
import { isCityDataStale, shouldAutoRefresh } from "@/lib/weatherRefresh";
import { fetchReverse } from "@/features/weather/fetchReverse";
import { fetchWeather } from "@/features/weather";

// טעינה עצלה של ForecastList
const ForecastList = dynamic(
    () => import('@/components/ForecastList/ForecastList.lazy'),
    { ssr: false, loading: () => <div className="w-full h-64 animate-pulse bg-muted rounded-xl" /> },
);

export default function CityInfo() {
    const t = useTranslations();

    const localeLang = useWeatherStore((s) => s.locale);
    const currentIndex = useWeatherStore((s) => s.currentIndex);
    const cities = useWeatherStore((s) => s.cities);
    const autoLocationCityId = useWeatherStore((s) => s.autoLocationCityId);
    const unit = useWeatherStore((s) => s.unit);

    const getUserTimezoneOffset = useWeatherStore((s) => s.getUserTimezoneOffset);
    const removeCity = useWeatherStore((s) => s.removeCity);
    const showToast = useWeatherStore((s) => s.showToast);
    const refreshCity = useWeatherStore((s) => s.refreshCity);
    const updateCity = useWeatherStore((s) => s.updateCity);

    const [isRefreshing, setIsRefreshing] = useState(false);

    const cityWeather = cities[currentIndex]; // CityWeather | undefined

    const refreshCityIfNeeded = useCallback(async (city: CityWeather, options: { langChanged?: boolean; force?: boolean } = {}) => {
        const { langChanged = false, force = false } = options;
        const isStale = isCityDataStale(city);
        if (!isStale && !force) return;

        setIsRefreshing(true);
        try {
            let reverseData;
            if (langChanged) {
                reverseData = await fetchReverse(city.lat, city.lon, localeLang);
            }

            const freshData: CityWeather = await fetchWeather({
                id: city.id,
                lat: city.lat,
                lon: city.lon,
                name: reverseData?.name || city.name,
                country: reverseData?.country || city.country,
                unit,
            });

            freshData.lastUpdated = Date.now();
            updateCity({ ...freshData });
            showToast({ message: 'toasts.refreshed' });
        } catch {
            showToast({ message: 'toasts.error' });
            updateCity(cityWeather);
            refreshCity(city.id);
        }
        setIsRefreshing(false);
    }, [unit, localeLang, updateCity, showToast, refreshCity]);

    useEffect(() => {
        if (cityWeather && shouldAutoRefresh(cityWeather)) {
            refreshCityIfNeeded(cityWeather, { force: false });
        }
    }, [refreshCityIfNeeded, cityWeather]);

    if (!cityWeather) {
        return null;
    }

    console.log(cityWeather.current.codeId);

    return (
        <div className="w-full bg-card rounded-xl p-6 shadow-md border border-border">
            <div className="w-full flex items-start justify-between">
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => refreshCityIfNeeded(cityWeather, { force: true })}
                    title={t('refresh')}
                    disabled={isRefreshing}
                    aria-label="Refresh"
                >
                    {isRefreshing ? (
                        <Loader2 size={18} className="animate-spin" role="presentation" />
                    ) : (
                        <RotateCcw size={18} role="presentation" />
                    )}
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeCity(cityWeather.id)}
                    title={t('remove')}
                    aria-label="Remove"
                >
                    <Trash size={18} role="presentation" />
                </Button>
            </div>
            <div className="w-full flex flex-row items-start justify-around">
                {/* Current weather */}
                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center justify-center gap-10">
                        <div className="flex flex-col items-center gap-2">
                            <div className="relative text-7xl font-thin">
                                {formatTemperatureWithConversion(cityWeather.current.temp, cityWeather.unit, unit)}
                            </div>
                            <p className="text-xl capitalize font-semibold">{t(`weather.conditions.${cityWeather.current.codeId}.description`)}</p>
                            <p className="text-sm opacity-70">
                                {t('feelsLike')} {formatTemperatureWithConversion(cityWeather.current.feelsLike, cityWeather.unit, unit)}
                            </p>
                        </div>
                        <WeatherIcon
                            code={cityWeather.current.icon}
                            alt={cityWeather.current.desc}
                            size={96}
                            priority
                            className="shrink-0"
                        />
                    </div>


                </div>
                {/* Header with city name and actions */}
                <div className="flex flex-col items-center justify-between">
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex flex-col items-center">
                            <h2 className="text-lg font-bold flex items-center flex-row gap-2">
                                {cityWeather.name}{' '}
                                {cityWeather.isCurrentLocation || cityWeather.id === autoLocationCityId ? <LocateFixed size={18} role="presentation" data-testid="location-icon" /> : ''}
                            </h2>
                            <p className="text-sm opacity-70">{cityWeather.country}</p>
                        </div>
                        <WeatherTimeNow timezone={cityWeather.current.timezone} lastUpdated={cityWeather.lastUpdated} />
                    </div>
                </div>
            </div>
            {/* Weather details grid */}
            <div className="grid grid-cols-6 gap-4 w-full mt-10">
                <div className="flex flex-col items-center justify-center gap-1">
                    <div className="flex flex-row items-center justify-center gap-2">
                        <p className="font-bold">{cityWeather.current.humidity}%</p>
                        <Droplets className="h-5 w-5 text-blue-500" role="presentation" />
                    </div>
                    <p className="text-sm opacity-70">{t('humidity')}</p>
                </div>

                <div className="flex flex-col items-center justify-center gap-1">
                    <div className="flex flex-row items-center justify-center gap-2">
                        <p className="font-bold" data-testid="wind">
                            {formatWindSpeed(cityWeather.current.wind, cityWeather.unit)}{' '}
                            {getWindDirection(cityWeather.current.windDeg)}
                        </p>
                        <Wind className="h-5 w-5 text-blue-400" role="presentation" />
                    </div>
                    <p className="text-sm opacity-70">{t('wind')}</p>
                </div>

                <div className="flex flex-col items-center justify-center gap-1">
                    <div className="flex flex-row items-center justify-center gap-2">
                        <p className="font-bold">{formatPressure(cityWeather.current.pressure)}</p>
                        <Gauge className="h-5 w-5 text-purple-500" role="presentation" />
                    </div>
                    <p className="text-sm opacity-70">{t('pressure')}</p>
                </div>

                <div className="flex flex-col items-center justify-center gap-1">
                    <div className="flex flex-row items-center justify-center gap-2">
                        <p className="font-bold">{formatVisibility(cityWeather.current.visibility)}</p>
                        <Eye className="h-5 w-5 text-amber-500" role="presentation" />
                    </div>
                    <p className="text-sm opacity-70">{t('visibility')}</p>
                </div>

                <div className="flex flex-col items-center justify-center gap-1">
                    <div className="flex flex-row items-center justify-center gap-2">
                        <p className="font-bold">{cityWeather.current.clouds}%</p>
                        <Cloud className="h-5 w-5 text-gray-400" role="presentation" />
                    </div>
                    <p className="text-sm opacity-70">{t('clouds')}</p>
                </div>

                <div className="flex flex-col items-center justify-center gap-1">
                    <div className="flex flex-row items-center justify-center gap-2">
                        <p className="font-bold">N/A</p>
                        <Sun className="h-5 w-5 text-yellow-500" />
                    </div>
                    <p className="text-sm opacity-70">{t('uvIndex')}</p>
                </div>
            </div>

            {/* Sunrise/Sunset */}
            <div className="grid grid-cols-2 gap-4 w-full mt-3">
                {/* Sunrise */}
                <div className="flex items-center justify-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div className="flex flex-col items-center">
                        <p className="font-bold flex flex-row items-center gap-2">
                            <span>{formatTimeWithOffset(cityWeather.current.sunrise, cityWeather.current.timezone)}</span>
                            <Sunrise className="h-5 w-5 text-amber-500" />
                        </p>
                        <p className="text-sm opacity-70">{t('sunrise')}</p>
                        {!isSameTimezone(cityWeather.current.timezone, getUserTimezoneOffset()) && (
                            <span className="ml-2 text-xs opacity-70">
                                ({formatTimeWithOffset(cityWeather.current.sunrise, getUserTimezoneOffset())}{' '}
                                {t('yourTime')})
                            </span>
                        )}
                    </div>
                </div>

                {/* Sunset */}
                <div className="flex items-center justify-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <div className="flex flex-col items-center">
                        <p className="font-bold flex flex-row items-center gap-2">
                            <span>{formatTimeWithOffset(cityWeather.current.sunset, cityWeather.current.timezone)}</span>
                            <Sunset className="h-5 w-5 text-indigo-500" />
                        </p>
                        <p className="text-sm opacity-70">{t('sunset')}</p>
                        {!isSameTimezone(cityWeather.current.timezone, getUserTimezoneOffset()) && (
                            <span className="ml-2 text-xs opacity-70">
                                ({formatTimeWithOffset(cityWeather.current.sunset, getUserTimezoneOffset())}{' '}
                                {t('yourTime')})
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <ForecastList cityUnit={cityWeather.unit} forecast={cityWeather.forecast} unit={cityWeather.unit} />
        </div>
    );
}