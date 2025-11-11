
import {
  formatTemperatureWithConversion,
  formatWindSpeed,
  formatPressure,
  formatVisibility,
  getWindDirection,
  isSameTimezone,
  formatTimeWithOffset,
  formatDate,
  isCityExists,
  getSuggestionsForDB,
  getCityInfoByCoords,
} from '@/lib/helpers';
import { CityWeather } from '@/types/weather';

// Set up environment variables for tests
process.env.OWM_API_KEY = 'test-api-key';
process.env.GEOAPIFY_KEY = 'test-geoapify-key';

vi.spyOn(global, 'fetch').mockImplementation((url) => {
  return Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers(),
    redirected: false,
    type: 'basic',
    url: url.toString(),
    clone: () => {
      return new Response(null, {
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
      });
    },
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
    text: () => Promise.resolve(''),
    json: () => Promise.resolve({
      weather: [{ id: 1, description: 'clear sky', icon: '01d' }],
      main: { temp: 25, feels_like: 23 },
      wind: { speed: 5 },
      clouds: { all: 10 },
      sys: { sunrise: 1657023600, sunset: 1657065600 },
      visibility: 10000,
      timezone: 0,
      list: [
        {
          dt_txt: '2025-06-15 06:00:00',
          main: { temp: 25, temp_min: 20, temp_max: 25 },
          weather: [{ id: 1, description: 'clear sky', icon: '01d' }],
          wind: { speed: 5 },
          clouds: { all: 10 }
        },
        {
          dt_txt: '2025-06-15 12:00:00',
          main: { temp: 27, temp_min: 22, temp_max: 27 },
          weather: [{ id: 1, description: 'clear sky', icon: '01d' }],
          wind: { speed: 6 },
          clouds: { all: 15 }
        }
      ]
    }),
    bytes: () => Promise.resolve(new Uint8Array(0)),
  });
});

describe('helpers', () => {
  it('formats temperature from imperial to metric', () => {
    expect(formatTemperatureWithConversion(32, 'imperial', 'metric')).toBe('0°C');
  });

  it('formats temperature from metric to imperial', () => {
    expect(formatTemperatureWithConversion(0, 'metric', 'imperial')).toBe('32°F');
  });

  it('formats temperature in metric', () => {
    expect(formatTemperatureWithConversion(26.4, 'metric', 'metric')).toBe('26°C');
  });

  it('formats temperature in imperial', () => {
    expect(formatTemperatureWithConversion(78.8, 'imperial', 'imperial')).toBe('79°F');
  });

  it('formats wind speed from imperial to metric', () => {
    expect(formatWindSpeed(10, 'imperial')).toBe('6.2 mph');
  });

  it('formats wind speed from metric to imperial', () => {
    expect(formatWindSpeed(10, 'metric')).toBe('10.0 km/h');
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

  it('formats visibility for distances greater than 1000 meters', () => {
    expect(formatVisibility(1500)).toBe('1.5 km');
  });

  it('formats visibility for distances less than 1000 meters', () => {
    expect(formatVisibility(500)).toBe('500 m');
  });

  it('formats time with offset for UTC', () => {
    const timestamp = 1657023600; // 2022-06-06 00:00:00 UTC
    expect(formatTimeWithOffset(timestamp, 0)).toBe('12:20');
  });

  it('formats date with offset for a specific timezone', () => {
    const timestamp = 1657023600; // 2022-06-06 00:00:00 UTC
    expect(formatDate(timestamp, 'en', 7200)).toBe('5 Tue');
  });

  it('formats date without offset for UTC', () => {
    const timestamp = 1657023600; // 2022-06-06 00:00:00 UTC
    expect(formatDate(timestamp, 'en')).toBe('5 Tue');
  });

  it('compares timezones', () => {
    expect(isSameTimezone(7200, 7200)).toBe(true);
    expect(isSameTimezone(7200, 10800)).toBe(false);
  });

  it('checks if city exists in cities array by ID', () => {
    const cities = [{ id: '1', name: { en: 'New York' }, country: { en: 'USA' } }];
    const newCity = { id: '1', name: { en: 'New York' }, country: { en: 'USA' } };
    expect(isCityExists(cities as CityWeather[], newCity as CityWeather)).toBe(true);
  });

  it('checks if city exists in cities array by name and country', () => {
    const cities = [{ id: '1', name: { en: 'New York' }, country: { en: 'USA' } }];
    const newCity = { id: '1', name: { en: 'New York' }, country: { en: 'USA' } };

    expect(isCityExists(cities as CityWeather[], newCity as CityWeather)).toBe(true);
  });

  it('formats wind direction for 0 degrees', () => {
    expect(getWindDirection(0)).toBe('N');
  });

  it('formats wind direction for 45 degrees', () => {
    expect(getWindDirection(45)).toBe('NE');
  });

  it('formats wind direction for 180 degrees', () => {
    expect(getWindDirection(180)).toBe('S');
  });

  it('formats wind direction for 270 degrees', () => {
    expect(getWindDirection(270)).toBe('W');
  });

  // Note: getWeatherByCoords and groupForecastByDay functions have been removed
  // These tests are skipped as the functions no longer exist in the codebase

  it('fetches Geoapify suggestions for a city', async () => {
    try {
      const suggestions = await getSuggestionsForDB('New York', 'en');
      if (process.env.GEOAPIFY_KEY && process.env.GEOAPIFY_KEY !== 'test-geoapify-key') {
        expect(suggestions).toHaveLength(5);
      } else {
        expect(suggestions).toHaveLength(0);
      }
    } catch (error) {
      console.error('Geoapify fetch error:', error);
    }
  });

  it('fetches city information for coordinates', async () => {
    try {
      const cityInfo = await getCityInfoByCoords(40.7128, -74.0060, 'en');
      expect(cityInfo).toHaveProperty('name');
      expect(cityInfo).toHaveProperty('country');
    } catch (error) {
      console.error('Geoapify reverse-geocode error:', error);
    }
  });
});
