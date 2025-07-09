import { CityWeather } from "@/types/weather";
import React, { useCallback, useEffect, useState } from "react";
import { formatPressure, formatTemperatureWithConversion, formatTimeWithOffset, formatVisibility, formatWindSpeed, getWindDirection, isSameTimezone } from "../../lib/helpers";
import { Droplets, Wind, Gauge, Eye, Cloud, Sun, Sunrise, Sunset, Loader2, RotateCcw, Trash, Building2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useWeatherStore } from "@/stores/useWeatherStore";
import { WeatherIcon } from "../WeatherIcon/WeatherIcon";
import WeatherTimeNow from "./WeatherTimeNow";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { isCityDataStale, shouldAutoRefresh } from "@/lib/weatherRefresh";
import { fetchWeather } from "@/features/weather";
import { AppLocale } from "@/types/i18n";
import { motion } from "framer-motion";
import { Suspense } from "react";
import { removeParentheses } from "@/lib/utils";

const ForecastList = dynamic(() => import('@/components/ForecastList/ForecastList.lazy'), {
  ssr: false,
  loading: () => <div className="w-full h-64 animate-pulse bg-muted rounded-xl" />,
});

export default function CityInfo() {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;

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

  const cityWeather = cities[currentIndex];

  const cityLocale = cityWeather[locale === 'en' ? 'currentEn' : 'currentHe'];

  /**
   * Refreshes city weather data if needed or forced
   * Uses the cached fetchWeather function for data retrieval
   * Shows appropriate toast messages for success/error states
   */
  const refreshCityIfNeeded = useCallback(async (city: CityWeather, options: { force?: boolean } = {}) => {
    const { force = false } = options;
    const isStale = isCityDataStale(city);
    if (!isStale && !force) {
      showToast({ message: 'toasts.noRefreshNeeded', type: 'info' });
      return;
    }

    // Prevent multiple refreshes
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      const freshData = await fetchWeather({
        id: city.id,
        lat: city.lat,
        lon: city.lon,
        unit,
      });

      updateCity({ ...freshData, lastUpdated: Date.now() });
      showToast({ message: 'toasts.refreshed', type: 'success' });
    } catch {
      showToast({ message: 'toasts.error', type: 'error' });
      updateCity(cityWeather);
      refreshCity(city.id);
    } finally {
      setIsRefreshing(false);
    }
  }, [cityWeather, showToast, updateCity, refreshCity, isRefreshing, unit]);

  // Auto-refresh weather data if needed
  useEffect(() => {
    if (cityWeather && shouldAutoRefresh(cityWeather)) {
      refreshCityIfNeeded(cityWeather, { force: false });
    }
  }, [cityWeather, refreshCityIfNeeded]);

  // Guard clause for when no city is selected
  if (!cityWeather) return null;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <motion.div
        key={cityWeather.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}

        className="w-full bg-card rounded-xl p-6 flex flex-col gap-2"
      >
        <div className="flex w-full flex-row items-start justify-between">
          <div className="flex flex-1 flex-col">
            <div className="flex flex-col items-start justify-between ">
              <div className="flex flex-row items-center justify-between gap-2">
                <Building2 className="h-6 w-6 shrink-0" />
                <p className="text-2xl opacity-70">{cityWeather.country[locale]}</p>
                <div className="text-2xl font-bold flex items-center flex-row gap-2">
                  {removeParentheses(cityWeather.name[locale])}{' '}
                  {(cityLocale.isCurrentLocation || cityWeather.id === autoLocationCityId) && (
                    <WeatherIcon icon="location" size={24} />
                  )}
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="flex flex-col items-start"
              >
                <WeatherTimeNow timezone={cityLocale.current.timezone} />
              </motion.div>
            </div>

            <div className="flex flex-col items-center justify-center mt-6">
              <WeatherIcon
                code={cityLocale.current.icon}
                icon={null}
                alt={cityLocale.current.desc}
                size={96}
                priority
                className="shrink-0"
              />
              <div className="mt-4 text-center">
                <div className="text-7xl font-light">
                  {formatTemperatureWithConversion(cityLocale.current.temp, cityLocale.unit, unit)}
                </div>
                <div className="text-lg font-medium opacity-80 mt-1">
                  {cityLocale.current.desc}
                </div>
                <div className="text-sm opacity-70">
                  {t('feelsLike')} {formatTemperatureWithConversion(cityLocale.current.feelsLike, cityLocale.unit, unit)}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-1 flex-col items-end justify-end">
            <div className="flex items-start justify-start">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => refreshCityIfNeeded(cityWeather, { force: true })}
                title={t('refresh')}
                disabled={isRefreshing}
                aria-label="Refresh"
              >
                <motion.div
                  key={isRefreshing ? 'loading' : 'refresh'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {isRefreshing ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <RotateCcw size={18} />
                  )}
                </motion.div>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeCity(cityWeather.id)}
                // disabled={cityWeather.id === autoLocationCityId}
                title={t('remove')}
                aria-label="Remove"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash size={18} />
              </Button>
            </div>
            <div className="self-center">
              <div className="grid grid-cols-2 gap-4 w-full mt-10">
                {[ // values to animate
                  { label: t('humidity'), value: `${cityLocale.current.humidity}%`, icon: <Droplets className="h-5 w-5 text-blue-500" /> },
                  { label: t('wind'), value: `${formatWindSpeed(cityLocale.current.wind, cityLocale.unit)} ${getWindDirection(cityLocale.current.windDeg)}`, icon: <Wind className="h-5 w-5 text-blue-400" /> },
                  { label: t('pressure'), value: formatPressure(cityLocale.current.pressure), icon: <Gauge className="h-5 w-5 text-purple-500" /> },
                  { label: t('visibility'), value: formatVisibility(cityLocale.current.visibility), icon: <Eye className="h-5 w-5 text-amber-500" /> },
                  { label: t('clouds'), value: `${cityLocale.current.clouds}%`, icon: <Cloud className="h-5 w-5 text-gray-400" /> },
                  { label: t('uvIndex'), value: 'N/A', icon: <Sun className="h-5 w-5 text-yellow-500" /> },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="flex flex-col items-center justify-center gap-1"
                  >
                    <div className="flex flex-row items-center justify-center gap-2">
                      <p className="font-bold">{item.value}</p>
                      {item.icon}
                    </div>
                    <p className="text-sm opacity-70">{item.label}</p>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 w-full mt-3">
                {[
                  {
                    time: formatTimeWithOffset(cityLocale.current.sunrise, cityLocale.current.timezone),
                    label: t('sunrise'),
                    icon: <Sunrise className="h-5 w-5 text-amber-500" />,
                    userTime: formatTimeWithOffset(cityLocale.current.sunrise, getUserTimezoneOffset())
                  },
                  {
                    time: formatTimeWithOffset(cityLocale.current.sunset, cityLocale.current.timezone),
                    label: t('sunset'),
                    icon: <Sunset className="h-5 w-5 text-indigo-500" />,
                    userTime: formatTimeWithOffset(cityLocale.current.sunset, getUserTimezoneOffset())
                  },
                ].map(({ time, label, icon, userTime }, idx) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 + idx * 0.1, duration: 0.4 }}
                    className={idx === 0
                      ? "flex items-center justify-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg"
                      : "flex items-center justify-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg"
                    }
                  >
                    <div className="flex flex-col items-center">
                      <p className="font-bold flex flex-row items-center gap-2">
                        <span>{time}</span>
                        {icon}
                      </p>
                      <p className="text-sm opacity-70">{label}</p>
                      {!isSameTimezone(cityLocale.current.timezone, getUserTimezoneOffset()) && (
                        <span className="ml-2 text-xs opacity-70">
                          ({userTime} {t('yourTime')})
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>



        <ForecastList cityUnit={cityLocale.unit} forecast={cityLocale.forecast} unit={cityLocale.unit} />
      </motion.div>
    </Suspense>
  );
}
