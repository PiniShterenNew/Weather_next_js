// types/weather.d.ts
export interface WeatherForecastItem {
  date: number; 
  min: number; 
  max: number; 
  icon: string; 
  desc: string; 
  codeId: number;
}

export interface WeatherCurrent {
  codeId: number;
  temp: number; 
  feelsLike: number; 
  desc: string; 
  icon: string; 
  humidity: number; 
  wind: number; 
  windDeg: number; 
  pressure: number; 
  visibility: number; 
  clouds: number; 
  sunrise: number; 
  sunset: number;
  timezone: number;
}

export interface BilingualName {
  en: string;
  he: string;
}

export interface CityWeatherCurrent {
  lat: number;
  lon: number;
  current: WeatherCurrent;
  forecast: WeatherForecastItem[];
  lastUpdated: number;
  unit: 'metric'; 
  isCurrentLocation?: boolean; 
}

export interface CityWeather{
  currentEn: CityWeatherCurrent;
  currentHe: CityWeatherCurrent;
  name: BilingualName;
  country: BilingualName;
  id: string;
  lat: number;
  lon: number;
  lastUpdated: number;
  isCurrentLocation?: boolean; 
}
  