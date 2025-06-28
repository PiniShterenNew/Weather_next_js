import {
    formatTemperature,
    formatWindSpeed,
    formatPressure,
    formatVisibility,
    getWindDirection,
    isSameTimezone,
  } from '@/lib/helpers';
  
  describe('helpers', () => {
    it('formats temperature in metric', () => {
      expect(formatTemperature(26.4, 'metric')).toBe('26°C');
    });
  
    it('formats temperature in imperial', () => {
      expect(formatTemperature(78.8, 'imperial')).toBe('79°F');
    });
  
    it('formats wind speed in metric', () => {
      expect(formatWindSpeed(5.123, 'metric')).toBe('5.1 km/h');
    });
  
    it('formats wind speed in imperial', () => {
      expect(formatWindSpeed(3.45, 'imperial')).toBe('2.1 mph');
    });
  
    it('formats pressure', () => {
      expect(formatPressure(1013)).toBe('1013 hPa');
    });
  
    it('formats visibility', () => {
      expect(formatVisibility(10000)).toBe('10.0 km');
    });
  
    it('returns wind direction string', () => {
      expect(getWindDirection(90)).toBe('E');
      expect(getWindDirection(225)).toBe('SW');
    });
  
    it('compares timezones', () => {
      expect(isSameTimezone(7200, 7200)).toBe(true);
      expect(isSameTimezone(7200, 10800)).toBe(false);
    });
  });
  