// tests/fixtures/existingCity.ts
import { CityWeather } from '@/types/weather';

export const existingCity: CityWeather = {
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
    temp: 22,
    feelsLike: 24,
    tempMin: 18,
    tempMax: 26,
    desc: 'Clear',
    icon: '01d',
    humidity: 65,
    wind: 12.5,
    windDeg: 180,
    pressure: 1013,
    visibility: 10000,
    clouds: 0,
    sunrise: 1640995200,
    sunset: 1641034800,
    timezone: 'America/New_York',
    uvIndex: null,
    rainProbability: null
  },
  forecast: [
    {
      date: Date.now() + 86_400_000,
      min: 18,
      max: 26,
      icon: '01d',
      desc: 'Sunny',
      codeId: 800,
      humidity: null,
      wind: null,
      clouds: null
    }
  ],
  hourly: [
    {
      time: Date.now(),
      temp: 22,
      icon: '01d',
      desc: 'Clear',
      codeId: 800,
      wind: 12.5,
      humidity: 65
    }
  ]
};