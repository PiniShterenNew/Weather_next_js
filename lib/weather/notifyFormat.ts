/**
 * Weather notification formatting utilities
 */

// Define weather data type for OpenWeather API response
type WeatherData = {
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  visibility: number;
  sys: {
    sunrise: number;
    sunset: number;
  };
  timezone: number;
};

export interface NotificationData {
  city: string;
  temperature: number;
  description: string;
  windSpeed: number;
  windDirection: string;
  unit: 'celsius' | 'fahrenheit';
  locale: 'he' | 'en';
}

/**
 * Format wind direction from degrees to readable direction
 */
export function formatWindDirection(degrees: number, locale: 'he' | 'en'): string {
  const directions = {
    en: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
    he: ['צ', 'צמ', 'מ', 'דמ', 'ד', 'דמ', 'מ', 'צמ']
  };
  
  const index = Math.round(degrees / 45) % 8;
  return directions[locale][index];
}

/**
 * Format temperature with unit
 */
export function formatTemperature(temp: number, unit: 'celsius' | 'fahrenheit'): string {
  return unit === 'celsius' ? `${Math.round(temp)}°C` : `${Math.round(temp)}°F`;
}

/**
 * Format wind speed with unit
 */
export function formatWindSpeed(speed: number, locale: 'he' | 'en'): string {
  const unit = locale === 'he' ? 'קמ״ש' : 'km/h';
  return `${Math.round(speed)} ${unit}`;
}

/**
 * Create notification message based on weather data and locale
 */
export function createNotificationMessage(data: NotificationData): string {
  const { city, temperature, description, windSpeed, windDirection, unit, locale } = data;
  
  const temp = formatTemperature(temperature, unit);
  const wind = formatWindSpeed(windSpeed, locale);
  const windDir = formatWindDirection(parseInt(windDirection), locale);
  
  if (locale === 'he') {
    return `בוקר טוב! ${city}: ${temp}, ${description}. רוחות ${windDir} ${wind}.`;
  } else {
    return `Good morning! ${city}: ${temp}, ${description}. Winds ${windDir} ${wind}.`;
  }
}

/**
 * Create evening notification message
 */
export function createEveningNotificationMessage(data: NotificationData): string {
  const { city, temperature, description, windSpeed, windDirection, unit, locale } = data;
  
  const temp = formatTemperature(temperature, unit);
  const wind = formatWindSpeed(windSpeed, locale);
  const windDir = formatWindDirection(parseInt(windDirection), locale);
  
  if (locale === 'he') {
    return `ערב טוב! ${city}: ${temp}, ${description}. רוחות ${windDir} ${wind}.`;
  } else {
    return `Good evening! ${city}: ${temp}, ${description}. Winds ${windDir} ${wind}.`;
  }
}

/**
 * Convert weather data to notification format
 */
export function weatherToNotificationData(
  weather: WeatherData,
  cityName: string,
  unit: 'celsius' | 'fahrenheit',
  locale: 'he' | 'en'
): NotificationData {
  return {
    city: cityName,
    temperature: unit === 'celsius' ? weather.main.temp : (weather.main.temp * 9/5) + 32,
    description: weather.weather[0]?.description || '',
    windSpeed: weather.wind?.speed || 0,
    windDirection: weather.wind?.deg?.toString() || '0',
    unit,
    locale,
  };
}
