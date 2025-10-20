import React from "react";
import { formatTemperatureWithConversion, isSameTimezone } from "../../lib/helpers";
import { Loader2, RotateCcw, Trash, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { useWeatherStore } from "@/store/useWeatherStore";
import { WeatherIcon } from "../WeatherIcon/WeatherIcon";
import { WeatherTimeNow } from "@/features/weather";
import { Button } from "@/components/ui/button";
import { CityWeather, CityWeatherCurrent } from "@/types/weather";
import { AppLocale } from "@/types/i18n";

interface CityHeaderProps {
  cityWeather: CityWeather;
  cityLocale: CityWeatherCurrent;
  locale: AppLocale;
  isRefreshing: boolean;
  onRefresh: () => void;
  onRemove: () => void;
}

export default function CityHeader({ 
  cityWeather, 
  cityLocale, 
  locale, 
  isRefreshing, 
  onRefresh, 
  onRemove 
}: CityHeaderProps) {
  const t = useTranslations();
  const getUserTimezoneOffset = useWeatherStore((s) => s.getUserTimezoneOffset);
  const currentUnit = useWeatherStore((s) => s.unit);
  const autoLocationCityId = useWeatherStore((s) => s.autoLocationCityId);
  const isCurrentLocation = cityWeather.id === autoLocationCityId;

  return (
    <div className="pt-2 px-2">
      {/* Drag handle zone - allows swipe between cities */}
      <div className="min-h-[50px]" data-drag-handle>
        {/* Header with city name and action buttons */}
        <div className="flex justify-between items-center mb-4">
          <h1 id="city-name" className="text-xl font-bold text-gray-900 dark:text-white animate-slide-up flex items-center gap-2">
            {isCurrentLocation && (
              <div title={t('cities.currentLocation')} aria-label={t('cities.currentLocation')}>
                <MapPin className="h-5 w-5 text-sky-500 dark:text-sky-400 animate-pulse flex-shrink-0" aria-hidden="true" />
              </div>
            )}
            <span>{cityWeather.name[locale] || cityWeather.name.en}</span>
          </h1>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={onRefresh}
              title={t('refresh')}
              disabled={isRefreshing}
              aria-label={`${t('refresh')} ${cityWeather.name[locale] || cityWeather.name.en}`}
              aria-busy={isRefreshing}
              className={`h-8 w-8 hover-scale transition-all text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 ${isRefreshing ? 'refresh-rotate animate-pulse ring-2 ring-brand-400/50' : ''}`}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin-180 text-brand-500" aria-hidden="true" />
              ) : (
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onRemove}
              title={t('remove')}
              aria-label={`${t('remove')} ${cityWeather.name[locale] || cityWeather.name.en}`}
              className="h-8 w-8 hover-scale text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <Trash className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 py-2" data-drag-handle>
        <div className="flex items-center gap-3 animate-fade-in">
          <WeatherIcon
            code={String(cityLocale.current.codeId)}
            icon={cityLocale.current.icon}
            size={50}
            className="text-5xl text-brand-400"
          />
          <p className="text-sm text-gray-600 dark:text-white/70 font-medium">
            {cityWeather.country[locale]}
          </p>
        </div>

        <div className="text-center animate-scale-in">
          <p className="text-6xl font-light text-gray-900 dark:text-white tabular-nums tracking-tight leading-tight">
            {formatTemperatureWithConversion(cityLocale.current.temp, cityLocale.unit, currentUnit)}
          </p>
          <p className="text-base text-gray-700 dark:text-white/80 capitalize font-medium mt-2">
            {cityLocale.current.desc}
          </p>
          
          {/* Feels Like - right below temperature */}
          <div className="text-center mt-3">
            <p className="text-sm text-gray-600 dark:text-white/60">
              {t('feelsLike')} {formatTemperatureWithConversion(cityLocale.current.feelsLike, cityLocale.unit, currentUnit)}
            </p>
          </div>
        </div>

        <WeatherTimeNow
          timezone={cityLocale.current.timezone}
          userTimezoneOffset={getUserTimezoneOffset()}
          isSameTimezone={isSameTimezone(cityLocale.current.timezone, getUserTimezoneOffset())}
        />

        {(cityLocale.current.tempMin !== undefined && cityLocale.current.tempMax !== undefined) && (
          <div className="flex items-center gap-4 text-sm tabular-nums animate-fade-in">
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-black/40 border border-red-500/30 hover-scale transition-all">
              <span className="text-red-500 dark:text-red-400 font-bold text-lg" aria-label={t('high')}>↑</span>
              <span className="font-bold text-gray-900 dark:text-white text-lg">{formatTemperatureWithConversion(cityLocale.current.tempMax, cityLocale.unit, currentUnit)}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-50 dark:bg-black/40 border border-blue-500/30 hover-scale transition-all">
              <span className="text-blue-500 dark:text-blue-400 font-bold text-lg" aria-label={t('low')}>↓</span>
              <span className="font-bold text-gray-900 dark:text-white text-lg">{formatTemperatureWithConversion(cityLocale.current.tempMin, cityLocale.unit, currentUnit)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
