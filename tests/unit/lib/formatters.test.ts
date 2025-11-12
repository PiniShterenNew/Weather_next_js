import { describe, it, expect } from 'vitest';
import { formatTemperatureWithConversion, getWindDirection, formatWindSpeed, formatRainProbability, formatVisibility, formatPressure, getUVIndexInfo } from '@/lib/helpers/formatters';

describe('formatters', () => {
  it('formatTemperatureWithConversion converts between C and F', () => {
    expect(formatTemperatureWithConversion(0, 'metric', 'imperial')).toBe('32°F');
    expect(formatTemperatureWithConversion(32, 'imperial', 'metric')).toBe('0°C');
    expect(formatTemperatureWithConversion(10.4, 'metric', 'metric')).toBe('10°C');
  });

  it('formatWindSpeed formats per unit', () => {
    expect(formatWindSpeed(10, 'metric')).toBe('10.0 km/h');
    expect(formatWindSpeed(10, 'imperial')).toBe('6.2 mph');
  });

  it('formatPressure returns hPa', () => {
    expect(formatPressure(1013)).toBe('1013 hPa');
  });

  it('formatVisibility formats km for >= 1000', () => {
    expect(formatVisibility(800)).toBe('800 m');
    expect(formatVisibility(1500)).toBe('1.5 km');
  });

  it('formatRainProbability shows percentage', () => {
    expect(formatRainProbability(0.345)).toBe('35%');
  });

  it('getWindDirection maps degrees to cardinal', () => {
    expect(getWindDirection(0)).toBe('N');
    expect(getWindDirection(90)).toBe('E');
    expect(getWindDirection(180)).toBe('S');
    expect(getWindDirection(270)).toBe('W');
    expect(getWindDirection(45)).toBe('NE');
    // negative and wrap-around handling
    expect(getWindDirection(-10)).toBe('N');
    expect(getWindDirection(370)).toBe('N');
  });

  it('getUVIndexInfo covers all ranges', () => {
    expect(getUVIndexInfo(0)).toEqual({ description: 'Low', risk: 'low' });
    expect(getUVIndexInfo(3)).toEqual({ description: 'Moderate', risk: 'moderate' });
    expect(getUVIndexInfo(6)).toEqual({ description: 'High', risk: 'high' });
    expect(getUVIndexInfo(9)).toEqual({ description: 'Very High', risk: 'very-high' });
    expect(getUVIndexInfo(11)).toEqual({ description: 'Extreme', risk: 'extreme' });
  });
});


