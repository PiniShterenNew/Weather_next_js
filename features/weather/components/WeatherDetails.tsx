import React from "react";
import { formatTimeWithOffset, formatWindSpeed, getWindDirection, formatVisibility, getUVIndexInfo, formatRainProbability } from "@/lib/helpers";
import { Droplets, Wind, Gauge, Sunrise, Sunset, Eye, Cloud, Sun, CloudRain } from "lucide-react";
import { useTranslations } from "next-intl";
import { CityWeatherCurrent } from "@/types/weather";
import { AppLocale } from "@/types/i18n";
import { useWeatherStore } from "@/store/useWeatherStore";

interface WeatherDetailsProps {
  cityLocale: CityWeatherCurrent;
  _locale: AppLocale;
}

export default function WeatherDetails({ cityLocale, _locale }: WeatherDetailsProps) {
  const t = useTranslations();
  const currentUnit = useWeatherStore((s) => s.unit);

  return (
    <div className="w-full" data-testid="temperature">
      {/* Weather cards - 2 per row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Humidity */}
        <div className="text-center p-4 rounded-2xl bg-blue-50/80 dark:bg-white/10 hover-lift transition-all animate-fade-in flex flex-col gap-2 items-center border border-blue-200/50 dark:border-white/5">
          <Droplets className="text-lg text-blue-500 dark:text-blue-400" />
          <p className="text-xl font-semibold tabular-nums text-gray-900 dark:text-white/90">
            {cityLocale.current.humidity}<span className="text-base">%</span>
          </p>
          <p className="text-xs text-gray-600 dark:text-white/70 font-medium">{t('humidity')}</p>
        </div>

        {/* Wind */}
        <div className="text-center p-4 rounded-2xl bg-teal-50/80 dark:bg-white/10 hover-lift transition-all animate-fade-in flex flex-col gap-2 items-center border border-teal-200/50 dark:border-white/5">
          <Wind className="text-lg text-teal-500 dark:text-teal-400" />
          <p className="text-xl font-semibold tabular-nums text-gray-900 dark:text-white/90">
            {formatWindSpeed(cityLocale.current.wind, currentUnit).split(' ')[0]}
          </p>
          <p className="text-xs text-gray-600 dark:text-white/70 font-medium">
            {getWindDirection(cityLocale.current.windDeg)} • {currentUnit === 'metric' ? 'km/h' : 'mph'}
          </p>
        </div>

        {/* Pressure */}
        <div className="text-center p-4 rounded-2xl bg-gray-50/80 dark:bg-white/10 hover-lift transition-all animate-fade-in flex flex-col gap-2 items-center border border-gray-200/50 dark:border-white/5">
          <Gauge className="text-lg text-gray-500 dark:text-gray-400" />
          <p className="text-xl font-semibold tabular-nums text-gray-900 dark:text-white/90">{cityLocale.current.pressure}</p>
          <p className="text-xs text-gray-600 dark:text-white/70 font-medium">hPa</p>
        </div>

        {/* Visibility */}
        <div className="text-center p-4 rounded-2xl bg-purple-50/80 dark:bg-white/10 hover-lift transition-all animate-fade-in flex flex-col gap-2 items-center border border-purple-200/50 dark:border-white/5">
          <Eye className="text-lg text-purple-500 dark:text-purple-400" />
          <p className="text-xl font-semibold tabular-nums text-gray-900 dark:text-white/90">
            {formatVisibility(cityLocale.current.visibility)}
          </p>
          <p className="text-xs text-gray-600 dark:text-white/70 font-medium">{t('visibility')}</p>
        </div>

        {/* Clouds */}
        <div className="text-center p-4 rounded-2xl bg-slate-50/80 dark:bg-white/10 hover-lift transition-all animate-fade-in flex flex-col gap-2 items-center border border-slate-200/50 dark:border-white/5">
          <Cloud className="text-lg text-slate-500 dark:text-slate-400" />
          <p className="text-xl font-semibold tabular-nums text-gray-900 dark:text-white/90">
            {cityLocale.current.clouds}<span className="text-base">%</span>
          </p>
          <p className="text-xs text-gray-600 dark:text-white/70 font-medium">{t('clouds')}</p>
        </div>

        {/* Rain Probability */}
        <div className="text-center p-4 rounded-2xl bg-blue-50/80 dark:bg-white/10 hover-lift transition-all animate-fade-in flex flex-col gap-2 items-center border border-blue-200/50 dark:border-white/5">
          <CloudRain className="text-lg text-blue-500 dark:text-blue-400" />
          <p className="text-xl font-semibold tabular-nums text-gray-900 dark:text-white/90">
            {cityLocale.current.rainProbability !== undefined ? formatRainProbability(cityLocale.current.rainProbability) : '--'}
          </p>
          <p className="text-xs text-gray-600 dark:text-white/70 font-medium">{t('rainProbability')}</p>
        </div>

        {/* UV Index - only show if data is available */}
        {cityLocale.current.uvIndex !== undefined && (
          <div className="text-center p-4 rounded-2xl bg-amber-50/80 dark:bg-white/10 hover-lift transition-all animate-fade-in flex flex-col gap-2 items-center border border-amber-200/50 dark:border-white/5">
            <Sun className="text-lg text-amber-500 dark:text-amber-400" />
            <p className="text-xl font-semibold tabular-nums text-gray-900 dark:text-white/90">
              {cityLocale.current.uvIndex.toFixed(1)}
            </p>
            <p className="text-xs text-gray-600 dark:text-white/70 font-medium">
              {t('uvIndex')}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              {getUVIndexInfo(cityLocale.current.uvIndex).description}
            </p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-white/20 to-transparent my-4"></div>
      
      {/* Sunrise and Sunset */}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-4 rounded-2xl bg-yellow-50/80 dark:bg-white/10 hover-lift transition-all animate-fade-in flex flex-col gap-2 items-center border border-yellow-200/50 dark:border-white/5" role="region" aria-label="Sunrise time">
          <Sunrise className="text-lg text-orange-400 dark:text-orange-300" aria-hidden="true" />
          <p className="text-xl font-semibold tabular-nums text-gray-900 dark:text-white/90" dir="ltr">
            {formatTimeWithOffset(cityLocale.current.sunrise, cityLocale.current.timezone)}
          </p>
          <p className="text-xs text-gray-600 dark:text-white/70 font-medium">{t('sunrise')}</p>
        </div>
        <div className="text-center p-4 rounded-2xl bg-orange-50/80 dark:bg-white/10 hover-lift transition-all animate-fade-in flex flex-col gap-2 items-center border border-orange-200/50 dark:border-white/5" role="region" aria-label="Sunset time">
          <Sunset className="text-lg text-orange-500 dark:text-orange-400" aria-hidden="true" />
          <p className="text-xl font-semibold tabular-nums text-gray-900 dark:text-white/90" dir="ltr">
            {formatTimeWithOffset(cityLocale.current.sunset, cityLocale.current.timezone)}
          </p>
          <p className="text-xs text-gray-600 dark:text-white/70 font-medium">{t('sunset')}</p>
        </div>
      </div>
    </div>
  );
}
