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

  type HourlyNumberKey = Exclude<keyof OpenMeteoResponse['hourly'], 'time'>;
  type DailyNumberKey = Exclude<keyof OpenMeteoResponse['daily'], 'time' | 'sunrise' | 'sunset'>;
  type DailyStringKey = Extract<keyof OpenMeteoResponse['daily'], 'sunrise' | 'sunset'>;

  const getHourlyNumber = (key: HourlyNumberKey, index: number): number | null => {
    const value = data.hourly?.[key]?.[index];
    return typeof value === 'number' ? value : null;
  };

  const getDailyNumber = (key: DailyNumberKey, index: number): number | null => {
    const value = data.daily?.[key]?.[index];
    return typeof value === 'number' ? value : null;
  };

  const getDailyString = (key: DailyStringKey, index: number): string | null => {
    const value = data.daily?.[key]?.[index];
    return typeof value === 'string' ? value : null;
  };

  // Find current weather index in hourly data
  // Calculate current time in city's timezone (same format as hourly.time from API)
  // hourly.time comes in ISO format according to the city's timezone (e.g., "2024-01-01T14:00")
  const now = new Date();
  const cityTimeFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  // Format current time in city timezone as ISO-like string (YYYY-MM-DDTHH:MM)
  const cityTimeParts = cityTimeFormatter.formatToParts(now);
  const getValue = (type: string) => cityTimeParts.find(p => p.type === type)?.value || '0';
  
  // Round down to nearest hour (remove minutes/seconds)
  const cityHour = parseInt(getValue('hour'));
  const cityNowIso = `${getValue('year')}-${getValue('month')}-${getValue('day')}T${cityHour.toString().padStart(2, '0')}:00`;
  
  // Try to find exact match first
  let idx = data.hourly?.time?.indexOf(cityNowIso) ?? -1;
  
  // If exact match not found, find the closest future hour
  if (idx === -1 && data.hourly?.time) {
    const cityNowTime = new Date(cityNowIso).getTime();
    let closestIndex = 0;
    let minDiff = Infinity;
    
    data.hourly.time.forEach((hourTime, index) => {
      const hourTimeMs = new Date(hourTime).getTime();
      const diff = hourTimeMs - cityNowTime;
      // Find the first future hour (or current hour if within 30 minutes)
      if (diff >= -1800000 && diff < minDiff) { // -30 minutes to future
        minDiff = diff;
        closestIndex = index;
      }
    });
    
    idx = closestIndex;
  }
  
  // Fallback to 0 if still not found
  if (idx === -1) {
    idx = 0;
  }
  
  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.debug('🔍 Mapping Debug:', {
      timezone: tz,
      cityNowIso,
      apiCurrentWeather: data.current_weather?.time,
      idx,
      hourly_time_sample: data.hourly?.time?.slice(0, 5),
      found_hour: data.hourly?.time?.[idx]
    });
  }

  // Map current weather
  const current = {
    time: data.current_weather?.time || cityNowIso,
    temp: data.current_weather?.temperature ?? 0,
    feels_like: idx >= 0
      ? getHourlyNumber('apparent_temperature', idx)
      : getHourlyNumber('apparent_temperature', 0),
    wind_speed: data.current_weather?.windspeed ?? 0,
    wind_deg: data.current_weather?.winddirection ?? 0,
    wind_gust: idx >= 0
      ? getHourlyNumber('wind_gusts_10m', idx)
      : getHourlyNumber('wind_gusts_10m', 0),
    humidity: idx >= 0
      ? getHourlyNumber('relative_humidity_2m', idx)
      : getHourlyNumber('relative_humidity_2m', 0),
    pressure: idx >= 0
      ? getHourlyNumber('pressure_msl', idx)
      : getHourlyNumber('pressure_msl', 0),
    clouds: idx >= 0
      ? getHourlyNumber('cloud_cover', idx)
      : getHourlyNumber('cloud_cover', 0),
    pop: idx >= 0
      ? getHourlyNumber('precipitation_probability', idx)
      : getHourlyNumber('precipitation_probability', 0),
    visibility: idx >= 0
      ? getHourlyNumber('visibility', idx)
      : getHourlyNumber('visibility', 0),
    uvi: idx >= 0 ? getHourlyNumber('uv_index', idx) : getHourlyNumber('uv_index', 0),
    dew_point: idx >= 0
      ? getHourlyNumber('dew_point_2m', idx)
      : getHourlyNumber('dew_point_2m', 0),
    weather_code: data.current_weather?.weathercode ?? 0,
    is_day: idx >= 0 ? Boolean(getHourlyNumber('is_day', idx)) : getHourlyNumber('is_day', 0) === 1,
    sunrise: getDailyString('sunrise', 0),
    sunset: getDailyString('sunset', 0),
  };

  // Map hourly data (limit to 48 hours for performance)
  const hourly = (data.hourly?.time ?? [])
    .slice(0, 48)
    .map((t: string, i: number) => ({
      time: t,
      temp: getHourlyNumber('temperature_2m', i) ?? 0,
      feels_like: getHourlyNumber('apparent_temperature', i),
      humidity: getHourlyNumber('relative_humidity_2m', i),
      pressure: getHourlyNumber('pressure_msl', i),
      clouds: getHourlyNumber('cloud_cover', i),
      pop: getHourlyNumber('precipitation_probability', i),
      precip_mm: getHourlyNumber('precipitation', i),
      rain_mm: getHourlyNumber('rain', i),
      snow_mm: getHourlyNumber('snowfall', i),
      wind_speed: getHourlyNumber('wind_speed_10m', i),
      wind_gust: getHourlyNumber('wind_gusts_10m', i),
      wind_deg: getHourlyNumber('wind_direction_10m', i),
      uvi: getHourlyNumber('uv_index', i),
      dew_point: getHourlyNumber('dew_point_2m', i),
      visibility: getHourlyNumber('visibility', i),
      weather_code: getHourlyNumber('weathercode', i),
      is_day: getHourlyNumber('is_day', i) === 1,
    }));

  // Map daily data (limit to 7 days)
  const daily = (data.daily?.time ?? [])
    .slice(0, 7)
    .map((t: string, i: number) => ({
      date: t,
      min: getDailyNumber('temperature_2m_min', i) ?? 0,
      max: getDailyNumber('temperature_2m_max', i) ?? 0,
      feels_like_min: getDailyNumber('apparent_temperature_min', i),
      feels_like_max: getDailyNumber('apparent_temperature_max', i),
      pop_max: getDailyNumber('precipitation_probability_max', i),
      precip_sum_mm: getDailyNumber('precipitation_sum', i),
      wind_speed_max: getDailyNumber('windspeed_10m_max', i),
      wind_gust_max: getDailyNumber('windgusts_10m_max', i),
      sunrise: getDailyString('sunrise', i),
      sunset: getDailyString('sunset', i),
      uvi_max: getDailyNumber('uv_index_max', i),
      weather_code: getDailyNumber('weathercode', i),
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
    meta: { lat, lon, tz, currentHourIndex: idx >= 0 ? idx : 0, offsetSec: data.utc_offset_seconds } 
  };
}
