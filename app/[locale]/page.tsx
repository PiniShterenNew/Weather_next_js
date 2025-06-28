'use client';

import SearchBar from '@/components/SearchBar/SearchBar';
import WeatherCarousel from '@/components/WeatherCarousel/WeatherCarousel';
import TempUnitToggle from '@/components/ToggleButtons/TempUnitToggle';
import LanguageSwitcher from '@/components/ToggleButtons/LanguageSwitcher';
import ThemeSwitcher from '@/components/ToggleButtons/ThemeSwitcher';
import { QuickCityAdd } from '@/components/WeatherCard/QuickCityAdd';
import { useWeatherStore } from '@/stores/useWeatherStore';

export default function HomePage() {
  const cities = useWeatherStore((s) => s.cities);
  return (
    <main className="min-h-screen p-4 flex flex-col gap-6 items-center">
      <div className="flex gap-4 justify-between w-full max-w-xl">
        <SearchBar />
        {cities.length > 0 && <div className="flex justify-center">
          <QuickCityAdd />
        </div>}
        <div className="flex gap-2">
          <TempUnitToggle />
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </div>

      <WeatherCarousel />
    </main>
  );
}
