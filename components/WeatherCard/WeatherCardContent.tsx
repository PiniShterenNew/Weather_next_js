import { AppLocale } from "@/types/i18n";
import { CityWeather, CityWeatherCurrent } from "@/types/weather";
import { formatTimeWithOffset } from "@/lib/helpers";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import ForecastListSkeleton from "../skeleton/ForecastListSkeleton";
import CityHeader from "./CityHeader";
import { WeatherDetails } from "@/features/weather";
import { useCityManagement } from "@/hooks/useCityManagement";
import { useWeatherStore } from "@/store/useWeatherStore";

const ForecastList = dynamic(() => import('@/components/ForecastList/ForecastList'), {
  ssr: false,
  loading: () => <ForecastListSkeleton />,
});

const HourlyForecast = dynamic(() => import('@/features/weather/components/HourlyForecast'), {
  ssr: false,
  loading: () => <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />,
});

interface WeatherCardContentProps {
  cityWeather: CityWeather;
  locale: AppLocale;
  cityLocale: CityWeatherCurrent;
}

export function WeatherCardContent({ cityWeather, locale, cityLocale }: WeatherCardContentProps) {
  const t = useTranslations();
  const { isRefreshing, handleRefresh, handleRemove } = useCityManagement(cityWeather, locale);
  const unit = useWeatherStore((s) => s.unit);

  return (
    <div 
      className={`h-full overflow-y-auto overflow-x-hidden scroll-smooth scrollbar-hide animate-fade-in transition-all duration-300 ${isRefreshing ? 'opacity-60' : 'opacity-100'}`} 
      role="article" 
      aria-labelledby="city-name"
      style={{ touchAction: 'pan-y' }}
    >
      <div className="flex flex-col gap-4 p-4 md:p-6 xl:p-8 pb-6 md:pb-8 xl:pb-10">
        {/* Header - Always at top, same for mobile and desktop */}
        <div 
          className="flex-shrink-0" 
          data-drag-handle
        >
          <CityHeader
            cityWeather={cityWeather}
            cityLocale={cityLocale}
            locale={locale}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
            onRemove={handleRemove}
          />
        </div>

        {/* Weather Details - Always after header */}
        <WeatherDetails cityLocale={cityLocale} _locale={locale} />

        {/* Content below - Responsive layout */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-6 gap-4">
          {/* Left Column - Hourly Forecast */}
          <div className="flex flex-col gap-4">
            {/* Hourly Forecast */}
            {cityWeather.hourly && cityWeather.hourly.length > 0 && (
              <HourlyForecast 
                hourly={cityWeather.hourly} 
                cityUnit={cityWeather.unit} 
                unit={unit} 
              />
            )}

            {/* Last Updated */}
            <div className="text-center">
              <p className="text-xs text-gray-600 dark:text-white/50" aria-live="polite">
                {t('lastUpdated')} <span dir="ltr">{formatTimeWithOffset(cityWeather.lastUpdated / 1000, cityLocale.current.timezone)}</span>
              </p>
            </div>
          </div>

          {/* Right Column - Daily Forecast */}
          <div className="flex flex-col gap-4">
            <ForecastList 
              cityUnit={cityWeather.unit} 
              forecast={cityWeather.forecast} 
              unit={unit} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
