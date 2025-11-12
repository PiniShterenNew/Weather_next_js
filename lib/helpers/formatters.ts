import { TemporaryUnit } from '@/types/ui';

export function formatTemperatureWithConversion(
  value: number,
  fromUnit: TemporaryUnit,
  toUnit: TemporaryUnit
): string {
  let converted = value;

  if (fromUnit !== toUnit) {
    // Convert between °C and °F
    converted =
      toUnit === 'metric'
        ? ((value - 32) * 5) / 9       // F → C
        : (value * 9) / 5 + 32;        // C → F
  }

  return `${Math.round(converted)}°${toUnit === 'metric' ? 'C' : 'F'}`;
}

export function formatWindSpeed(speed: number, unit: TemporaryUnit): string {
  return unit === 'metric' ? `${speed.toFixed(1)} km/h` : `${(speed * 0.621_371).toFixed(1)} mph`;
}

export function formatPressure(pressure: number): string {
  return `${pressure} hPa`;
}

export function formatVisibility(distance: number): string {
  return distance >= 1000 ? `${(distance / 1000).toFixed(1)} km` : `${distance} m`;
}

/**
 * Format rain probability to percentage
 * @param probability - rain probability (0-1)
 * @returns formatted percentage string
 */
export function formatRainProbability(probability: number): string {
  return `${Math.round(probability * 100)}%`;
}

/**
 * Get UV Index description and risk level
 * @param uvIndex - UV Index value
 * @returns object with description and risk level
 */
export function getUVIndexInfo(uvIndex: number): { description: string; risk: 'low' | 'moderate' | 'high' | 'very-high' | 'extreme' } {
  if (uvIndex <= 2) return { description: 'Low', risk: 'low' };
  if (uvIndex <= 5) return { description: 'Moderate', risk: 'moderate' };
  if (uvIndex <= 7) return { description: 'High', risk: 'high' };
  if (uvIndex <= 10) return { description: 'Very High', risk: 'very-high' };
  return { description: 'Extreme', risk: 'extreme' };
}

/**
 * Convert wind degrees to cardinal direction
 * @param degrees - wind direction in degrees (0-360)
 * @returns cardinal direction string
 */
export function getWindDirection(degrees: number): string {
  const directions = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW',
  ];
  // Normalize degrees to [0, 360)
  const normalized = ((degrees % 360) + 360) % 360;
  const index = Math.round(normalized / 22.5) % 16;
  return directions[index];
}

