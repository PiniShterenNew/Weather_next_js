import { AppLocale } from '@/types/i18n';
import { CityWeather } from '@/types/weather';

type FetchWeatherInput = {
  id: string;
  lat: number;
  lon: number;
  name: string;
  country: string;
  lang: AppLocale;
  unit: 'metric' | 'imperial';
};

export async function fetchWeather({
  id,
  lat,
  lon,
  name,
  country,
  lang,
  unit,
}: FetchWeatherInput): Promise<CityWeather> {
  const response = await fetch(
    `/api/weather?lat=${lat}&lon=${lon}&name=${name}&country=${country}&lang=${lang}&unit=${unit}`,
  );
  if (!response.ok) throw new Error('Failed to fetch weather');

  const data: CityWeather = await response.json();
  return { ...data, id };
}
