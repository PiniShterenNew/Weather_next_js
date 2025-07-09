// tests/api/weatherRoute.test.ts
import { GET as weatherRoute } from '@/app/api/weather/route';
import { vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock all dependencies
vi.mock('@/lib/helpers', () => ({
  getWeatherByCoords: vi.fn(),
}));

vi.mock('@/lib/weatherCache', () => ({
  getCachedWeather: vi.fn(),
  setCachedWeather: vi.fn(),
  getCacheStats: vi.fn(),
}));

vi.mock('@/lib/db/suggestion', () => ({
  findCityById: vi.fn(),
}));

vi.mock('@/lib/errors', () => ({
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  },
  NotFoundError: class extends Error {
    statusCode = 404;
    constructor(message: string) {
      super(`${message} not found`);
    }
  },
  ExternalApiError: class extends Error {
    statusCode = 502;
    constructor(service: string, message: string) {
      super(`${service} API error: ${message}`);
    }
  },
}));

import { getWeatherByCoords } from '@/lib/helpers';
import { getCachedWeather, setCachedWeather } from '@/lib/weatherCache';
import { findCityById } from '@/lib/db/suggestion';

function createRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/weather');
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return new NextRequest(url.toString(), { method: 'GET' });
}

const mockCityData = {
  id: 'city:32.1_34.8',
  city: { en: 'Tel Aviv', he: 'תל אביב' },
  country: { en: 'Israel', he: 'ישראל' },
  lat: 32.07,
  lon: 34.79,
};

const mockWeatherData = {
  he: {
    lat: 32.07,
    lon: 34.79,
    current: { temp: 25, feelsLike: 23, desc: 'שמש', icon: '01d', humidity: 50, pressure: 1013, visibility: 10000, wind: 5, windDeg: 90, clouds: 0, sunrise: 0, sunset: 0, timezone: 0, codeId: 800 },
    forecast: [],
    lastUpdated: Date.now(),
    unit: 'metric' as const
  },
  en: {
    lat: 32.07,
    lon: 34.79,
    current: { temp: 25, feelsLike: 23, desc: 'Sunny', icon: '01d', humidity: 50, pressure: 1013, visibility: 10000, wind: 5, windDeg: 90, clouds: 0, sunrise: 0, sunset: 0, timezone: 0, codeId: 800 },
    forecast: [],
    lastUpdated: Date.now(),
    unit: 'metric' as const
  }
};

describe('GET /api/weather', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns 400 if required parameters are missing', async () => {
    const request = createRequest({ lat: '32.07' }); // missing lon and id
    const response = await weatherRoute(request);
    
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Missing required parameters: lon, id');
  });

  it('returns 404 if city not found in database', async () => {
    (findCityById as any).mockResolvedValue(null);
    
    const request = createRequest({ lat: '32.07', lon: '34.79', id: 'city:32.1_34.8' });
    const response = await weatherRoute(request);
    
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toContain('not found');
  });

  it('returns cached weather data if available', async () => {
    const cachedData = { ...mockWeatherData, cached: true };
    (findCityById as any).mockResolvedValue(mockCityData);
    (getCachedWeather as any).mockReturnValue(cachedData);
    
    const request = createRequest({ lat: '32.07', lon: '34.79', id: 'city:32.1_34.8' });
    const response = await weatherRoute(request);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.cached).toBe(true);
    expect(getCachedWeather).toHaveBeenCalledWith('city:32.1_34.8');
  });

  it('fetches fresh weather data if not cached', async () => {
    (findCityById as any).mockResolvedValue(mockCityData);
    (getCachedWeather as any).mockReturnValue(null);
    (getWeatherByCoords as any).mockResolvedValue(mockWeatherData);
    (setCachedWeather as any).mockResolvedValue(undefined);
    
    const request = createRequest({ lat: '32.07', lon: '34.79', id: 'city:32.1_34.8' });
    const response = await weatherRoute(request);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.id).toBe('city:32.1_34.8');
    expect(data.currentEn).toBeDefined();
    expect(data.currentHe).toBeDefined();
    expect(getWeatherByCoords).toHaveBeenCalledWith({
      lat: 32.07,
      lon: 34.79,
      name: mockCityData.city,
      country: mockCityData.country
    });
    expect(setCachedWeather).toHaveBeenCalled();
  });

  it('returns 502 on external API error', async () => {
    (findCityById as any).mockResolvedValue(mockCityData);
    (getCachedWeather as any).mockReturnValue(null);
    (getWeatherByCoords as any).mockRejectedValue(new Error('API failure'));
    
    const request = createRequest({ lat: '32.07', lon: '34.79', id: 'city:32.1_34.8' });
    const response = await weatherRoute(request);
    
    expect(response.status).toBe(502);
    const data = await response.json();
    expect(data.error).toContain('Weather API error');
  });

  it('returns 500 on unexpected error', async () => {
    (findCityById as any).mockRejectedValue(new Error('Database error'));
    
    const request = createRequest({ lat: '32.07', lon: '34.79', id: 'city:32.1_34.8' });
    const response = await weatherRoute(request);
    
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toContain('unexpected error occurred');
  });
});