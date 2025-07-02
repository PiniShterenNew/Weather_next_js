import { CityWeather } from '@/types/weather';

type FetchWeatherInput = {
  id: string;
  lat: number;
  lon: number;
  name: string;
  country: string;
  unit: 'metric' | 'imperial';
};

export async function fetchWeather({
  id,
  lat,
  lon,
  name,
  country,
  unit,
}: FetchWeatherInput): Promise<CityWeather> {
  const response = await fetch(
    `/api/weather?lat=${lat}&lon=${lon}&name=${name}&country=${country}&unit=${unit}&lang=en`,
  );
  if (!response.ok) throw new Error('Failed to fetch weather');

  const data: CityWeather = await response.json();
  return { ...data, id };
}
