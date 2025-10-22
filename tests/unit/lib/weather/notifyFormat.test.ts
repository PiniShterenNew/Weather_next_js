import { describe, it, expect } from 'vitest';
import {
  formatWindDirection,
  formatTemperature,
  formatWindSpeed,
  createNotificationMessage,
  createEveningNotificationMessage,
  weatherToNotificationData,
} from '@/lib/weather/notifyFormat';

describe('notifyFormat', () => {
  describe('formatWindDirection', () => {
    it('should format wind direction correctly in English', () => {
      expect(formatWindDirection(0, 'en')).toBe('N');
      expect(formatWindDirection(45, 'en')).toBe('NE');
      expect(formatWindDirection(90, 'en')).toBe('E');
      expect(formatWindDirection(180, 'en')).toBe('S');
      expect(formatWindDirection(270, 'en')).toBe('W');
    });

    it('should format wind direction correctly in Hebrew', () => {
      expect(formatWindDirection(0, 'he')).toBe('צ');
      expect(formatWindDirection(45, 'he')).toBe('צמ');
      expect(formatWindDirection(90, 'he')).toBe('מ');
      expect(formatWindDirection(180, 'he')).toBe('ד');
      expect(formatWindDirection(270, 'he')).toBe('מ');
    });
  });

  describe('formatTemperature', () => {
    it('should format temperature in Celsius', () => {
      expect(formatTemperature(22.5, 'celsius')).toBe('23°C');
      expect(formatTemperature(-5.2, 'celsius')).toBe('-5°C');
    });

    it('should format temperature in Fahrenheit', () => {
      expect(formatTemperature(72.5, 'fahrenheit')).toBe('73°F');
      expect(formatTemperature(32, 'fahrenheit')).toBe('32°F');
    });
  });

  describe('formatWindSpeed', () => {
    it('should format wind speed in English', () => {
      expect(formatWindSpeed(12.5, 'en')).toBe('13 km/h');
      expect(formatWindSpeed(0, 'en')).toBe('0 km/h');
    });

    it('should format wind speed in Hebrew', () => {
      expect(formatWindSpeed(12.5, 'he')).toBe('13 קמ״ש');
      expect(formatWindSpeed(0, 'he')).toBe('0 קמ״ש');
    });
  });

  describe('createNotificationMessage', () => {
    const mockData = {
      city: 'Tel Aviv',
      temperature: 25,
      description: 'sunny',
      windSpeed: 12,
      windDirection: '315',
      unit: 'celsius' as const,
      locale: 'en' as const,
    };

    it('should create morning notification in English', () => {
      const message = createNotificationMessage(mockData);
      expect(message).toContain('Good morning!');
      expect(message).toContain('Tel Aviv');
      expect(message).toContain('25°C');
      expect(message).toContain('sunny');
    });

    it('should create morning notification in Hebrew', () => {
      const hebrewData = { ...mockData, locale: 'he' as const };
      const message = createNotificationMessage(hebrewData);
      expect(message).toContain('בוקר טוב!');
      expect(message).toContain('Tel Aviv');
      expect(message).toContain('25°C');
      expect(message).toContain('sunny');
    });
  });

  describe('createEveningNotificationMessage', () => {
    const mockData = {
      city: 'Tel Aviv',
      temperature: 20,
      description: 'partly cloudy',
      windSpeed: 8,
      windDirection: '180',
      unit: 'celsius' as const,
      locale: 'en' as const,
    };

    it('should create evening notification in English', () => {
      const message = createEveningNotificationMessage(mockData);
      expect(message).toContain('Good evening!');
      expect(message).toContain('Tel Aviv');
      expect(message).toContain('20°C');
      expect(message).toContain('partly cloudy');
    });

    it('should create evening notification in Hebrew', () => {
      const hebrewData = { ...mockData, locale: 'he' as const };
      const message = createEveningNotificationMessage(hebrewData);
      expect(message).toContain('ערב טוב!');
      expect(message).toContain('Tel Aviv');
      expect(message).toContain('20°C');
      expect(message).toContain('partly cloudy');
    });
  });

  describe('weatherToNotificationData', () => {
    const mockWeather = {
      main: {
        temp: 25,
        feels_like: 27,
        temp_min: 20,
        temp_max: 30,
        humidity: 60,
        pressure: 1013,
      },
      weather: [
        {
          id: 800,
          main: 'Clear',
          description: 'clear sky',
          icon: '01d',
        },
      ],
      wind: {
        speed: 12,
        deg: 315,
      },
      clouds: {
        all: 0,
      },
      visibility: 10000,
      sys: {
        sunrise: 1640995200,
        sunset: 1641034800,
      },
      timezone: -18000,
      name: 'Tel Aviv',
    };

    it('should convert weather data to notification format in Celsius', () => {
      const result = weatherToNotificationData(mockWeather, 'Tel Aviv', 'celsius', 'en');
      
      expect(result.city).toBe('Tel Aviv');
      expect(result.temperature).toBe(25);
      expect(result.description).toBe('clear sky');
      expect(result.windSpeed).toBe(12);
      expect(result.windDirection).toBe('315');
      expect(result.unit).toBe('celsius');
      expect(result.locale).toBe('en');
    });

    it('should convert weather data to notification format in Fahrenheit', () => {
      const result = weatherToNotificationData(mockWeather, 'Tel Aviv', 'fahrenheit', 'en');
      
      expect(result.temperature).toBe(77); // 25 * 9/5 + 32
      expect(result.unit).toBe('fahrenheit');
    });
  });
});
