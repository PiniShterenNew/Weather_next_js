/**
 * Get dynamic background image class based on weather condition code and time
 * @param weatherCode - OpenWeather condition code
 * @param isNight - Whether it's nighttime (optional, defaults to false)
 * @returns Tailwind background class
 */
export function getWeatherBackground(weatherCode: number, isNight: boolean = false): string {
  // Night backgrounds
  if (isNight) {
    // Thunderstorm, rain, drizzle at night
    if (weatherCode >= 200 && weatherCode < 600) {
      return 'bg-rainy-day';
    }
    // Snow at night
    if (weatherCode >= 600 && weatherCode < 700) {
      return 'bg-snowy-day';
    }
    // Cloudy at night
    if (weatherCode >= 801 && weatherCode <= 804) {
      return 'bg-night-cloudy';
    }
    // Clear night
    return 'bg-night-clear';
  }

  // Day backgrounds
  // Thunderstorm (200-232)
  if (weatherCode >= 200 && weatherCode < 300) {
    return 'bg-rainy-day';
  }
  
  // Drizzle (300-321)
  if (weatherCode >= 300 && weatherCode < 400) {
    return 'bg-rainy-day';
  }
  
  // Rain (500-531)
  if (weatherCode >= 500 && weatherCode < 600) {
    return 'bg-rainy-day';
  }
  
  // Snow (600-622)
  if (weatherCode >= 600 && weatherCode < 700) {
    return 'bg-snowy-day';
  }
  
  // Atmosphere (mist, fog, etc.) (701-781)
  if (weatherCode >= 700 && weatherCode < 800) {
    return 'bg-cloudy-day';
  }
  
  // Clear sky (800)
  if (weatherCode === 800) {
    return 'bg-sunny-day';
  }
  
  // Clouds (801-804)
  if (weatherCode >= 801 && weatherCode <= 804) {
    return 'bg-cloudy-day';
  }
  
  // Default to cloudy
  return 'bg-cloudy-day';
}

/**
 * Check if it's nighttime based on current time and sunrise/sunset
 * @param currentTime - Current timestamp in seconds
 * @param sunrise - Sunrise timestamp in seconds
 * @param sunset - Sunset timestamp in seconds
 * @returns true if it's nighttime
 */
export function isNightTime(currentTime: number, sunrise: number, sunset: number): boolean {
  return currentTime < sunrise || currentTime > sunset;
}

