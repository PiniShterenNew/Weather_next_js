export type WeatherCode = number; // Open-Meteo WMO code

export interface CurrentWeather {
  time: string;              // ISO local per timezone
  temp: number;              // C
  feels_like: number | null; // derive from apparent_temperature hourly at same time
  wind_speed: number;        // km/h
  wind_deg: number;          // deg
  wind_gust: number | null;  // km/h
  humidity: number | null;   // %
  pressure: number | null;   // hPa
  clouds: number | null;     // %
  pop: number | null;        // %
  visibility: number | null; // m
  uvi: number | null;        // index
  dew_point: number | null;  // C
  weather_code: WeatherCode; // mapping to icon
  is_day: boolean | null;
  sunrise: string | null;    // ISO (today)
  sunset: string | null;     // ISO (today)
}

export interface HourPoint {
  time: string;
  temp: number;
  feels_like: number | null;
  humidity: number | null;
  pressure: number | null;
  clouds: number | null;
  pop: number | null;
  precip_mm: number | null;
  rain_mm: number | null;
  snow_mm: number | null;
  wind_speed: number | null;
  wind_gust: number | null;
  wind_deg: number | null;
  uvi: number | null;
  dew_point: number | null;
  visibility: number | null;
  weather_code: WeatherCode | null;
  is_day: boolean | null;
}

export interface DayPoint {
  date: string; // YYYY-MM-DD
  min: number;
  max: number;
  feels_like_min: number | null;
  feels_like_max: number | null;
  pop_max: number | null;       // %
  precip_sum_mm: number | null; // mm
  wind_speed_max: number | null;
  wind_gust_max: number | null;
  sunrise: string | null;
  sunset: string | null;
  uvi_max: number | null;
  weather_code: WeatherCode | null;
}

export interface WeatherBundle {
  current: CurrentWeather;
  hourly: HourPoint[];
  daily: DayPoint[];
  meta: { lat: number; lon: number; tz: string };
}

// Legacy types for backward compatibility
export interface CityWeather {
  id: string;
  lat: number;
  lon: number;
  name: {
    en: string;
    he: string;
  };
  country: {
    en: string;
    he: string;
  };
  isCurrentLocation?: boolean;
  current: {
    codeId: number;
    temp: number;
    feelsLike: number | null;
    tempMin: number;
    tempMax: number;
    desc: string;
    icon: string;
    humidity: number | null;
    wind: number;
    windDeg: number;
    pressure: number | null;
    visibility: number | null;
    clouds: number | null;
    sunrise: number | null;
    sunset: number | null;
    timezone: string;
    uvIndex: number | null;
    rainProbability: number | null;
  };
  forecast: WeatherForecastItem[];
  hourly: WeatherHourlyItem[];
  lastUpdated: number;
  unit: string;
}

export interface WeatherForecastItem {
  date: number;
  min: number;
  max: number;
  icon: string;
  desc: string;
  codeId: number;
  humidity: number | null;
  wind: number | null;
  clouds: number | null;
  sunrise?: string | null;
  sunset?: string | null;
}

export interface WeatherHourlyItem {
  time: number;
  temp: number;
  icon: string;
  desc: string;
  codeId: number;
  wind: number | null;
  humidity: number | null;
}

// Additional legacy types
export interface BilingualName {
  en: string;
  he: string;
}

export interface CityWeatherCurrent {
  current: WeatherCurrent;
  forecast: WeatherForecastItem[];
  hourly: WeatherHourlyItem[];
  lastUpdated: number;
  unit: string;
  lat: number;
  lon: number;
}

export interface WeatherCurrent {
  codeId: number;
  temp: number;
  feelsLike: number | null;
  tempMin: number;
  tempMax: number;
  desc: string;
  icon: string;
  humidity: number | null;
  wind: number;
  windDeg: number;
  pressure: number | null;
  visibility: number | null;
  clouds: number | null;
  sunrise: number | null;
  sunset: number | null;
  timezone: string;
  uvIndex: number | null;
  rainProbability: number | null;
}

// Open-Meteo API Response Types
export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  timezone_abbreviation: string;
  utc_offset_seconds: number;
  current_weather: {
    temperature: number;
    windspeed: number;
    winddirection: number;
    weathercode: number;
    time: string;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    apparent_temperature: number[];
    relative_humidity_2m: number[];
    dew_point_2m: number[];
    pressure_msl: number[];
    cloud_cover: number[];
    precipitation: number[];
    precipitation_probability: number[];
    rain: number[];
    snowfall: number[];
    wind_speed_10m: number[];
    wind_gusts_10m: number[];
    wind_direction_10m: number[];
    uv_index: number[];
    is_day: number[];
    weathercode: number[];
    visibility: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    apparent_temperature_max: number[];
    apparent_temperature_min: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
    windspeed_10m_max: number[];
    windgusts_10m_max: number[];
    weathercode: number[];
  };
}