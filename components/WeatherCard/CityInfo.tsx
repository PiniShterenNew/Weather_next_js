import { useWeatherStore } from "@/store/useWeatherStore";
import { motion } from "framer-motion";
import { Suspense } from "react";
import { WeatherCardContent } from "./WeatherCardContent";
import { WeatherCardSkeleton } from "./WeatherCardSkeleton";
import { useWeatherLocale } from "@/hooks/useWeatherLocale";

export default function CityInfo() {
  const currentIndex = useWeatherStore((s) => s.currentIndex);
  const cities = useWeatherStore((s) => s.cities);
  const cityWeather = cities[currentIndex];
  
  const { locale, cityLocale } = useWeatherLocale(cityWeather);

  if (!cityWeather || !cityLocale) {
    return <WeatherCardSkeleton />;
  }

  return (
    <Suspense fallback={<WeatherCardSkeleton />} data-testid="city-info">
      <motion.div
        key={cityWeather.id}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="w-full h-full flex flex-col"
        style={{ touchAction: 'manipulation' }}
      >
        <WeatherCardContent
          cityWeather={cityWeather}
          cityLocale={cityWeather}
          locale={locale}
        />
      </motion.div>
    </Suspense>
  );
}