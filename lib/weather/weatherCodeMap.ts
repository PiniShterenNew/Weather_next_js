import { WeatherCode } from '@/types/weather';

/**
 * Maps Open-Meteo WMO weather codes to icon IDs
 * Based on WMO Weather interpretation codes (WW)
 */
export function getWeatherIcon(weatherCode: WeatherCode, isDay: boolean | null = true): string {
  const daySuffix = isDay ? 'd' : 'n';
  
  switch (weatherCode) {
    // Clear sky
    case 0:
      return `01${daySuffix}`;
    
    // Mainly clear, partly cloudy, and overcast
    case 1:
    case 2:
    case 3:
      return `02${daySuffix}`;
    
    // Fog and depositing rime fog
    case 45:
    case 48:
      return `50${daySuffix}`;
    
    // Drizzle: Light, moderate and dense intensity
    case 51:
    case 53:
    case 55:
      return `09${daySuffix}`;
    
    // Freezing Drizzle: Light and dense intensity
    case 56:
    case 57:
      return `13${daySuffix}`;
    
    // Rain: Slight, moderate and heavy intensity
    case 61:
    case 63:
    case 65:
      return `10${daySuffix}`;
    
    // Freezing Rain: Light and heavy intensity
    case 66:
    case 67:
      return `13${daySuffix}`;
    
    // Snow fall: Slight, moderate, and heavy intensity
    case 71:
    case 73:
    case 75:
      return `13${daySuffix}`;
    
    // Snow grains
    case 77:
      return `13${daySuffix}`;
    
    // Rain showers: Slight, moderate, and violent
    case 80:
    case 81:
    case 82:
      return `09${daySuffix}`;
    
    // Snow showers slight and heavy
    case 85:
    case 86:
      return `13${daySuffix}`;
    
    // Thunderstorm: Slight or moderate
    case 95:
      return `11${daySuffix}`;
    
    // Thunderstorm with slight and heavy hail
    case 96:
    case 99:
      return `11${daySuffix}`;
    
    // Default fallback
    default:
      return `01${daySuffix}`;
  }
}

/**
 * Gets weather description based on WMO code
 */
export function getWeatherDescription(weatherCode: WeatherCode): string {
  switch (weatherCode) {
    case 0:
      return 'Clear sky';
    case 1:
      return 'Mainly clear';
    case 2:
      return 'Partly cloudy';
    case 3:
      return 'Overcast';
    case 45:
      return 'Fog';
    case 48:
      return 'Depositing rime fog';
    case 51:
      return 'Light drizzle';
    case 53:
      return 'Moderate drizzle';
    case 55:
      return 'Dense drizzle';
    case 56:
      return 'Light freezing drizzle';
    case 57:
      return 'Dense freezing drizzle';
    case 61:
      return 'Slight rain';
    case 63:
      return 'Moderate rain';
    case 65:
      return 'Heavy rain';
    case 66:
      return 'Light freezing rain';
    case 67:
      return 'Heavy freezing rain';
    case 71:
      return 'Slight snow fall';
    case 73:
      return 'Moderate snow fall';
    case 75:
      return 'Heavy snow fall';
    case 77:
      return 'Snow grains';
    case 80:
      return 'Slight rain showers';
    case 81:
      return 'Moderate rain showers';
    case 82:
      return 'Violent rain showers';
    case 85:
      return 'Slight snow showers';
    case 86:
      return 'Heavy snow showers';
    case 95:
      return 'Thunderstorm';
    case 96:
      return 'Thunderstorm with slight hail';
    case 99:
      return 'Thunderstorm with heavy hail';
    default:
      return 'Unknown';
  }
}

/**
 * Gets weather description in Hebrew
 */
export function getWeatherDescriptionHe(weatherCode: WeatherCode): string {
  switch (weatherCode) {
    case 0:
      return 'שמיים בהירים';
    case 1:
      return 'בהיר ברובו';
    case 2:
      return 'מעונן חלקית';
    case 3:
      return 'מעונן';
    case 45:
      return 'ערפל';
    case 48:
      return 'ערפל עם קרח';
    case 51:
      return 'טפטוף קל';
    case 53:
      return 'טפטוף בינוני';
    case 55:
      return 'טפטוף כבד';
    case 56:
      return 'טפטוף קל קפוא';
    case 57:
      return 'טפטוף כבד קפוא';
    case 61:
      return 'גשם קל';
    case 63:
      return 'גשם בינוני';
    case 65:
      return 'גשם כבד';
    case 66:
      return 'גשם קל קפוא';
    case 67:
      return 'גשם כבד קפוא';
    case 71:
      return 'שלג קל';
    case 73:
      return 'שלג בינוני';
    case 75:
      return 'שלג כבד';
    case 77:
      return 'גרגירי שלג';
    case 80:
      return 'ממטרים קלים';
    case 81:
      return 'ממטרים בינוניים';
    case 82:
      return 'ממטרים חזקים';
    case 85:
      return 'ממטרי שלג קלים';
    case 86:
      return 'ממטרי שלג כבדים';
    case 95:
      return 'סופת רעמים';
    case 96:
      return 'סופת רעמים עם ברד קל';
    case 99:
      return 'סופת רעמים עם ברד כבד';
    default:
      return 'לא ידוע';
  }
}
