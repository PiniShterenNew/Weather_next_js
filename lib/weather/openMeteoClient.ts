import { WeatherBundle, OpenMeteoResponse } from '@/types/weather';

export async function fetchOpenMeteo(lat: number, lon: number): Promise<WeatherBundle> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('current_weather', 'true');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('hourly', [
    'temperature_2m','apparent_temperature','relative_humidity_2m','dew_point_2m',
    'pressure_msl','cloud_cover','precipitation','precipitation_probability',
    'rain','snowfall','wind_speed_10m','wind_gusts_10m','wind_direction_10m',
    'uv_index','is_day','weathercode','visibility'
  ].join(','));
  url.searchParams.set('daily', [
    'temperature_2m_max','temperature_2m_min','apparent_temperature_max','apparent_temperature_min',
    'precipitation_sum','precipitation_probability_max','sunrise','sunset',
    'uv_index_max','windspeed_10m_max','windgusts_10m_max','weathercode'
  ].join(','));

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(url.toString(), { 
      next: { revalidate: 1800 },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status} ${response.statusText}`);
    }
    
    const data: OpenMeteoResponse = await response.json();
    
    // Debug logging (only in development)
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.debug('🔍 Open-Meteo API Response Debug:', {
        current_weather: data.current_weather,
        hourly_keys: Object.keys(data.hourly || {}),
        hourly_sample: {
          time: data.hourly?.time?.slice(0, 2),
          apparent_temperature: data.hourly?.apparent_temperature?.slice(0, 2),
          relative_humidity_2m: data.hourly?.relative_humidity_2m?.slice(0, 2),
          pressure_msl: data.hourly?.pressure_msl?.slice(0, 2),
          cloud_cover: data.hourly?.cloud_cover?.slice(0, 2),
          uv_index: data.hourly?.uv_index?.slice(0, 2),
          visibility: data.hourly?.visibility?.slice(0, 2)
        }
      });
    }
    
    return mapOpenMeteoResponse(data, lat, lon);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Open-Meteo API timeout');
    }
    throw error;
  }
}

function mapOpenMeteoResponse(data: OpenMeteoResponse, lat: number, lon: number): WeatherBundle {
  const tz = data.timezone;

  // Helper functions for safe array access
  const H = (key: keyof OpenMeteoResponse['hourly'], i: number, def: unknown = null): unknown => 
    data.hourly?.[key]?.[i] ?? def;
  const D = (key: keyof OpenMeteoResponse['daily'], i: number, def: unknown = null): unknown => 
    data.daily?.[key]?.[i] ?? def;

  // Find current weather index in hourly data
  const nowIso = data.current_weather?.time as string;
  const idx = data.hourly?.time?.indexOf(nowIso) ?? -1;
  
  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.debug('🔍 Mapping Debug:', {
      nowIso,
      idx,
      hourly_time_sample: data.hourly?.time?.slice(0, 3)
    });
  }

  // Map current weather
  const current = {
    time: nowIso,
    temp: data.current_weather?.temperature ?? 0,
    feels_like: idx >= 0 ? H('apparent_temperature', idx, null) : (data.hourly?.apparent_temperature?.[0] ?? null),
    wind_speed: data.current_weather?.windspeed ?? 0,
    wind_deg: data.current_weather?.winddirection ?? 0,
    wind_gust: idx >= 0 ? H('wind_gusts_10m', idx, null) : (data.hourly?.wind_gusts_10m?.[0] ?? null),
    humidity: idx >= 0 ? H('relative_humidity_2m', idx, null) : (data.hourly?.relative_humidity_2m?.[0] ?? null),
    pressure: idx >= 0 ? H('pressure_msl', idx, null) : (data.hourly?.pressure_msl?.[0] ?? null),
    clouds: idx >= 0 ? H('cloud_cover', idx, null) : (data.hourly?.cloud_cover?.[0] ?? null),
    pop: idx >= 0 ? H('precipitation_probability', idx, null) : (data.hourly?.precipitation_probability?.[0] ?? null),
    visibility: idx >= 0 ? H('visibility', idx, null) : (data.hourly?.visibility?.[0] ?? null),
    uvi: idx >= 0 ? H('uv_index', idx, null) : (data.hourly?.uv_index?.[0] ?? null),
    dew_point: idx >= 0 ? H('dew_point_2m', idx, null) : (data.hourly?.dew_point_2m?.[0] ?? null),
    weather_code: data.current_weather?.weathercode ?? 0,
    is_day: idx >= 0 ? Boolean(H('is_day', idx, null)) : (data.hourly?.is_day?.[0] === 1),
    sunrise: D('sunrise', 0, null),
    sunset: D('sunset', 0, null),
  };

  // Map hourly data (limit to 48 hours for performance)
  const hourly = (data.hourly?.time ?? [])
    .slice(0, 48)
    .map((t: string, i: number) => ({
      time: t,
      temp: H('temperature_2m', i, null),
      feels_like: H('apparent_temperature', i, null),
      humidity: H('relative_humidity_2m', i, null),
      pressure: H('pressure_msl', i, null),
      clouds: H('cloud_cover', i, null),
      pop: H('precipitation_probability', i, null),
      precip_mm: H('precipitation', i, null),
      rain_mm: H('rain', i, null),
      snow_mm: H('snowfall', i, null),
      wind_speed: H('wind_speed_10m', i, null),
      wind_gust: H('wind_gusts_10m', i, null),
      wind_deg: H('wind_direction_10m', i, null),
      uvi: H('uv_index', i, null),
      dew_point: H('dew_point_2m', i, null),
      visibility: H('visibility', i, null),
      weather_code: H('weathercode', i, null),
      is_day: H('is_day', i, null) === 1,
    }));

  // Map daily data (limit to 7 days)
  const daily = (data.daily?.time ?? [])
    .slice(0, 7)
    .map((t: string, i: number) => ({
      date: t,
      min: D('temperature_2m_min', i, null),
      max: D('temperature_2m_max', i, null),
      feels_like_min: D('apparent_temperature_min', i, null),
      feels_like_max: D('apparent_temperature_max', i, null),
      pop_max: D('precipitation_probability_max', i, null),
      precip_sum_mm: D('precipitation_sum', i, null),
      wind_speed_max: D('windspeed_10m_max', i, null),
      wind_gust_max: D('windgusts_10m_max', i, null),
      sunrise: D('sunrise', i, null),
      sunset: D('sunset', i, null),
      uvi_max: D('uv_index_max', i, null),
      weather_code: D('weathercode', i, null),
    }));

  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.debug('🔍 Mapped Current Weather:', {
      humidity: current.humidity,
      pressure: current.pressure,
      clouds: current.clouds,
      uvi: current.uvi,
      visibility: current.visibility,
      feels_like: current.feels_like
    });
  }

  return { 
    current, 
    hourly, 
    daily, 
    meta: { lat, lon, tz } 
  };
}
