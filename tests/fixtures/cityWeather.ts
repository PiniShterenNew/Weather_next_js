// tests/fixtures/cityWeather.ts
import { CityWeather } from '@/types/weather';

export const cityWeather: CityWeather = {
  id: 'existing',
  name: { en: 'New York', he: 'ניו יורק' },
  country: { en: 'United States', he: 'ארצות הברית' },
  lat: 40.7128,
  lon: -74.006,
  lastUpdated: Date.now(),
  isCurrentLocation: false,

  currentEn: {
    lat: 40.7128,
    lon: -74.006,
    unit: 'metric',
    lastUpdated: Date.now(),
    isCurrentLocation: false,
    current: {
      codeId: 800,
      temp: 20,
      feelsLike: 19,
      tempMin: 18,
      tempMax: 22,
      desc: 'Clear sky',
      icon: '01d',
      humidity: 60,
      wind: 3.5,
      windDeg: 180,
      pressure: 1013,
      visibility: 10000,
      clouds: 0,
      sunrise: 1710112800,
      sunset: 1710159600,
      timezone: -14400
    },
    forecast: [
      {
        date: Date.now() + 86_400_000,
        min: 18,
        max: 26,
        icon: '01d',
        desc: 'Sunny',
        codeId: 800
      },
      {
        date: Date.now() + 2 * 86_400_000,
        min: 19,
        max: 27,
        icon: '02d',
        desc: 'Partly cloudy',
        codeId: 801
      }
    ]
  },

  currentHe: {
    lat: 40.7128,
    lon: -74.006,
    unit: 'metric',
    lastUpdated: Date.now(),
    isCurrentLocation: false,
    current: {
      codeId: 800,
      temp: 20,
      feelsLike: 19,
      tempMin: 18,
      tempMax: 22,
      desc: 'שמיים בהירים',
      icon: '01d',
      humidity: 60,
      wind: 3.5,
      windDeg: 180,
      pressure: 1013,
      visibility: 10000,
      clouds: 0,
      sunrise: 1710112800,
      sunset: 1710159600,
      timezone: -14400
    },
    forecast: [
      {
        date: Date.now() + 86_400_000,
        min: 18,
        max: 26,
        icon: '01d',
        desc: 'שמשי',
        codeId: 800
      },
      {
        date: Date.now() + 2 * 86_400_000,
        min: 19,
        max: 27,
        icon: '02d',
        desc: 'מעונן חלקית',
        codeId: 801
      }
    ]
  }
};
