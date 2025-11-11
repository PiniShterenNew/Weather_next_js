import { describe, it, expect } from 'vitest';
import { getWeatherIcon, getWeatherDescription, getWeatherDescriptionHe } from '@/lib/weather/weatherCodeMap';

describe('weatherCodeMap', () => {
  describe('getWeatherIcon', () => {
    it('should return correct icon for clear sky (day)', () => {
      expect(getWeatherIcon(0, true)).toBe('01d');
    });

    it('should return correct icon for clear sky (night)', () => {
      expect(getWeatherIcon(0, false)).toBe('01n');
    });

    it('should return correct icon for partly cloudy (day)', () => {
      expect(getWeatherIcon(1, true)).toBe('02d');
      expect(getWeatherIcon(2, true)).toBe('02d');
      expect(getWeatherIcon(3, true)).toBe('02d');
    });

    it('should return correct icon for fog', () => {
      expect(getWeatherIcon(45, true)).toBe('50d');
      expect(getWeatherIcon(48, true)).toBe('50d');
    });

    it('should return correct icon for drizzle', () => {
      expect(getWeatherIcon(51, true)).toBe('09d');
      expect(getWeatherIcon(53, true)).toBe('09d');
      expect(getWeatherIcon(55, true)).toBe('09d');
    });

    it('should return correct icon for rain', () => {
      expect(getWeatherIcon(61, true)).toBe('10d');
      expect(getWeatherIcon(63, true)).toBe('10d');
      expect(getWeatherIcon(65, true)).toBe('10d');
    });

    it('should return correct icon for snow', () => {
      expect(getWeatherIcon(71, true)).toBe('13d');
      expect(getWeatherIcon(73, true)).toBe('13d');
      expect(getWeatherIcon(75, true)).toBe('13d');
    });

    it('should return correct icon for thunderstorms', () => {
      expect(getWeatherIcon(95, true)).toBe('11d');
      expect(getWeatherIcon(96, true)).toBe('11d');
      expect(getWeatherIcon(99, true)).toBe('11d');
    });

    it('should return default icon for unknown codes', () => {
      expect(getWeatherIcon(999, true)).toBe('01d');
      expect(getWeatherIcon(999, false)).toBe('01n');
    });
  });

  describe('getWeatherDescription', () => {
    it('should return correct English descriptions', () => {
      expect(getWeatherDescription(0)).toBe('Clear sky');
      expect(getWeatherDescription(1)).toBe('Mainly clear');
      expect(getWeatherDescription(2)).toBe('Partly cloudy');
      expect(getWeatherDescription(3)).toBe('Overcast');
      expect(getWeatherDescription(45)).toBe('Fog');
      expect(getWeatherDescription(51)).toBe('Light drizzle');
      expect(getWeatherDescription(61)).toBe('Slight rain');
      expect(getWeatherDescription(71)).toBe('Slight snow fall');
      expect(getWeatherDescription(95)).toBe('Thunderstorm');
    });

    it('should return "Unknown" for unknown codes', () => {
      expect(getWeatherDescription(999)).toBe('Unknown');
    });
  });

  describe('getWeatherDescriptionHe', () => {
    it('should return correct Hebrew descriptions', () => {
      expect(getWeatherDescriptionHe(0)).toBe('שמיים בהירים');
      expect(getWeatherDescriptionHe(1)).toBe('בהיר ברובו');
      expect(getWeatherDescriptionHe(2)).toBe('מעונן חלקית');
      expect(getWeatherDescriptionHe(3)).toBe('מעונן');
      expect(getWeatherDescriptionHe(45)).toBe('ערפל');
      expect(getWeatherDescriptionHe(51)).toBe('טפטוף קל');
      expect(getWeatherDescriptionHe(61)).toBe('גשם קל');
      expect(getWeatherDescriptionHe(71)).toBe('שלג קל');
      expect(getWeatherDescriptionHe(95)).toBe('סופת רעמים');
    });

    it('should return "לא ידוע" for unknown codes', () => {
      expect(getWeatherDescriptionHe(999)).toBe('לא ידוע');
    });
  });
});
