import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getWeatherCached } from '@/lib/server/weather';
import { WeatherBundle } from '@/types/weather';

// Use vi.hoisted to create mock functions that are accessible in vi.mock factories
const { mockFindUnique, mockUpsert, mockCityFindUnique } = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockUpsert: vi.fn(),
  mockCityFindUnique: vi.fn()
}));

// Mock Prisma - use hoisted mock functions
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    weatherCache: {
      findUnique: mockFindUnique,
      upsert: mockUpsert
    },
    city: {
      findUnique: mockCityFindUnique
    }
  }))
}));

// Mock Open-Meteo client data
const mockWeatherBundle: WeatherBundle = {
  current: {
    time: '2024-01-01T12:00:00',
    temp: 25.5,
    feels_like: 24.0,
    wind_speed: 12.3,
    wind_deg: 180,
    wind_gust: 15.0,
    humidity: 65,
    pressure: 1013,
    clouds: 0,
    pop: 0,
    visibility: 10000,
    uvi: 5.0,
    dew_point: 18.0,
    weather_code: 0,
    is_day: true,
    sunrise: '2024-01-01T06:30:00',
    sunset: '2024-01-01T18:30:00'
  },
  hourly: [
    {
      time: '2024-01-01T12:00:00',
      temp: 25.5,
      feels_like: 24.0,
      humidity: 65,
      pressure: 1013,
      clouds: 0,
      pop: 0,
      precip_mm: 0,
      rain_mm: 0,
      snow_mm: 0,
      wind_speed: 12.3,
      wind_gust: 15.0,
      wind_deg: 180,
      uvi: 5.0,
      dew_point: 18.0,
      visibility: 10000,
      weather_code: 0,
      is_day: true
    }
  ],
  daily: [
    {
      date: '2024-01-01',
      min: 18.0,
      max: 28.0,
      feels_like_min: 17.0,
      feels_like_max: 27.0,
      pop_max: 0,
      precip_sum_mm: 0,
      wind_speed_max: 15.0,
      wind_gust_max: 20.0,
      sunrise: '2024-01-01T06:30:00',
      sunset: '2024-01-01T18:30:00',
      uvi_max: 6.0,
      weather_code: 0
    }
  ],
  meta: {
    lat: 32.0853,
    lon: 34.7818,
    tz: 'Asia/Jerusalem'
  }
};

// Mock Open-Meteo client
vi.mock('@/lib/weather/openMeteoClient', () => ({
  fetchOpenMeteo: vi.fn()
}));

vi.mock('@/lib/utils', () => ({
  getCityId: vi.fn(() => 'test-city-id')
}));

describe('getWeatherCached', () => {
  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Get the mocked fetchOpenMeteo and set default behavior
    const { fetchOpenMeteo } = await import('@/lib/weather/openMeteoClient');
    vi.mocked(fetchOpenMeteo).mockResolvedValue(mockWeatherBundle);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return cached data if fresh', async () => {
    const cachedData = {
      payload: { id: 'test', temp: 25 },
      updatedAt: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
    };

    mockFindUnique.mockResolvedValue(cachedData);

    const result = await getWeatherCached('test-city-id', 32.0853, 34.7818, 'he');

    expect(result).toEqual(cachedData.payload);
    expect(mockUpsert).not.toHaveBeenCalled();
    
    // Verify fetchOpenMeteo was not called
    const { fetchOpenMeteo } = await import('@/lib/weather/openMeteoClient');
    expect(vi.mocked(fetchOpenMeteo)).not.toHaveBeenCalled();
  });

  it('should fetch new data if cache is stale', async () => {
    const staleData = {
      payload: { id: 'test', temp: 25 },
      updatedAt: new Date(Date.now() - 25 * 60 * 1000) // 25 minutes ago
    };

    const cityData = {
      cityEn: 'Tel Aviv',
      cityHe: 'תל אביב',
      countryEn: 'Israel',
      countryHe: 'ישראל'
    };

    mockFindUnique.mockResolvedValue(staleData);
    mockCityFindUnique.mockResolvedValue(cityData);
    mockUpsert.mockResolvedValue({});

    const result = await getWeatherCached('test-city-id', 32.0853, 34.7818, 'he');

    expect(result).toBeDefined();
    expect(result?.id).toBe('test-city-id');
    expect(result?.lat).toBe(32.0853);
    expect(result?.lon).toBe(34.7818);
    expect(result?.name.en).toBe('Tel Aviv');
    expect(result?.name.he).toBe('תל אביב');
    expect(result?.country.en).toBe('Israel');
    expect(result?.country.he).toBe('ישראל');
    expect(mockUpsert).toHaveBeenCalled();
    
    // Verify fetchOpenMeteo was called
    const { fetchOpenMeteo } = await import('@/lib/weather/openMeteoClient');
    expect(vi.mocked(fetchOpenMeteo)).toHaveBeenCalled();
  });

  it('should return stale cache if API fails', async () => {
    const staleData = {
      payload: { id: 'test', temp: 25 },
      updatedAt: new Date(Date.now() - 25 * 60 * 1000) // 25 minutes ago
    };

    // First call checks if cache is stale, second call is in the catch block
    mockFindUnique
      .mockResolvedValueOnce(staleData) // First call for stale check
      .mockResolvedValueOnce(staleData); // Second call for fallback in catch

    // Mock API failure
    const { fetchOpenMeteo } = await import('@/lib/weather/openMeteoClient');
    vi.mocked(fetchOpenMeteo).mockRejectedValueOnce(new Error('API Error'));

    const result = await getWeatherCached('test-city-id', 32.0853, 34.7818, 'he');

    expect(result).toEqual(staleData.payload);
    expect(vi.mocked(fetchOpenMeteo)).toHaveBeenCalled();
  });

  it('should return null if no cache and API fails', async () => {
    mockFindUnique.mockResolvedValue(null);

    // Mock API failure
    const { fetchOpenMeteo } = await import('@/lib/weather/openMeteoClient');
    vi.mocked(fetchOpenMeteo).mockRejectedValueOnce(new Error('API Error'));

    const result = await getWeatherCached('test-city-id', 32.0853, 34.7818, 'he');

    expect(result).toBeNull();
    expect(vi.mocked(fetchOpenMeteo)).toHaveBeenCalled();
  });

  it('should handle missing city data gracefully', async () => {
    mockFindUnique.mockResolvedValue(null);
    mockCityFindUnique.mockResolvedValue(null);
    mockUpsert.mockResolvedValue({});

    const result = await getWeatherCached('test-city-id', 32.0853, 34.7818, 'he');

    expect(result).toBeDefined();
    expect(result?.name.en).toBe('Unknown City');
    expect(result?.name.he).toBe('עיר לא ידועה');
    expect(result?.country.en).toBe('Unknown');
    expect(result?.country.he).toBe('לא ידוע');
    
    // Verify fetchOpenMeteo was called
    const { fetchOpenMeteo } = await import('@/lib/weather/openMeteoClient');
    expect(vi.mocked(fetchOpenMeteo)).toHaveBeenCalled();
  });
});
