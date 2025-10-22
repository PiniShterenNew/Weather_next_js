// types/weather.d.ts
export interface WeatherForecastItem {
  date: number; 
  min: number; 
  max: number; 
  icon: string; 
  desc: string; 
  codeId: number;
  // מידע נוסף
  humidity?: number;
  wind?: number;
  clouds?: number;
}

export interface WeatherHourlyItem {
  time: number; // timestamp
  temp: number;
  icon: string;
  desc: string;
  codeId: number;
  wind: number;
  humidity: number;
}

export interface WeatherCurrent {
  codeId: number;
  temp: number; 
  feelsLike: number; 
  tempMin: number;
  tempMax: number;
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
  uvIndex?: number; // UV Index (requires OneCall API)
  rainProbability?: number; // Rain probability (0-1) from forecast API
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
  hourly?: WeatherHourlyItem[]; // תחזית שעתית
  lastUpdated: number;
  unit: 'metric'; 
  isCurrentLocation?: boolean; 
}

export interface CityWeather{
  current: WeatherCurrent;
  forecast: WeatherForecastItem[];
  hourly: WeatherHourlyItem[];
  name: BilingualName;
  country: BilingualName;
  id: string;
  lat: number;
  lon: number;
  lastUpdated: number;
  unit: 'metric';
  isCurrentLocation?: boolean; 
}
  