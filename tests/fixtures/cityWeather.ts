// tests/fixtures/cityWeather.ts
import { CityWeather } from '@/types/weather';

export const cityWeather: CityWeather = {
  id: 'existing',
  name: { en: 'New York', he: 'ניו יורק' },
  country: { en: 'United States', he: 'ארצות הברית' },
  lat: 40.7128,
  lon: -74.006,
  lastUpdated: Date.now(),
  unit: 'metric',
  isCurrentLocation: false,

  current: {
    codeId: 800,
    temp: 19,
    feelsLike: 21,
    tempMin: 18,
    tempMax: 26,
    desc: 'Clear skies',
    icon: '01d',
    humidity: 65,
    wind: 12.5,
    windDeg: 180,
    pressure: 1013,
    visibility: 10000,
    clouds: 0,
    sunrise: 1640995200,
    sunset: 1641034800,
    timezone: -18000
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
  ],
  hourly: [
    {
      time: Date.now(),
      temp: 20,
      icon: '01d',
      desc: 'Clear skies',
      codeId: 800,
      wind: 12.5,
      humidity: 65
    },
    {
      time: Date.now() + 3600000,
      temp: 21,
      icon: '01d',
      desc: 'Clear skies',
      codeId: 800,
      wind: 13.0,
      humidity: 60
    }
  ]
};