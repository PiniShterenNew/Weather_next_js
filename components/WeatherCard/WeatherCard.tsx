'use client';

import { useWeatherStore } from '@/stores/useWeatherStore';
import type { CityWeather } from '@/types/weather';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  RotateCcw,
  Trash,
  LocateFixed,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  formatTemperatureWithConversion,
} from '../../lib/helpers';
import { WeatherIcon } from './WeatherIcon';
import WeatherTimeNow from './WeatherTimeNow';

type Properties = {
  city: CityWeather;
  isRefreshing: boolean;
  handleRefresh: (langChanged: boolean, force: boolean) => void;
};

export default function WeatherCard({ city, isRefreshing, handleRefresh }: Properties) {
  const t = useTranslations();
  const unit = useWeatherStore((s) => s.unit);
  const removeCity = useWeatherStore((s) => s.removeCity);
  const autoLocationCityId = useWeatherStore((s) => s.autoLocationCityId);


  return (
    <div className="w-full p-5 rounded-xl bg-card text-card-foreground overflow-y-auto scrollbar-none shadow-md space-y-4 w-full border border-border ">
   
    </div>
  );
}
