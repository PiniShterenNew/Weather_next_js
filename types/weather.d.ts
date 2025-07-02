import { AppLocale } from "./i18n";

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

export interface CityWeather {
  id: string; 
  name: string; 
  country: string; 
  lat: number;
  lon: number;
  current: WeatherCurrent;
  forecast: WeatherForecastItem[];
  lastUpdated: number;
  unit: 'metric'; 
  isCurrentLocation?: boolean; 
}
