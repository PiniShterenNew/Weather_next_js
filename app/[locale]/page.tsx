'use client';

import WeatherList from '@/components/WeatherList/Weatherlist';
import { QuickCityAdd } from '@/components/WeatherCard/QuickCityAdd';
import { useWeatherStore } from '@/stores/useWeatherStore';
import CityInfo from '@/components/WeatherCard/CityInfo';
import SettingsModal from '@/components/Settings/SettingsModal';

export default function HomePage() {
  return (
    <main className="min-h-screen w-full px-6 py-4 flex flex-col gap-6">
      <div className="w-full flex justify-between items-center">
        <QuickCityAdd />
        <SettingsModal />
      </div>

      <div className="w-full flex flex-row gap-6 items-start">
        <div className="w-1/4">
          <WeatherList />
        </div>
        <div className="w-3/4 flex flex-col gap-6">
          <CityInfo />
        </div>
      </div>
    </main>
  );
}
