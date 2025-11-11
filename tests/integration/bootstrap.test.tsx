import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useWeatherStore } from '@/store/useWeatherStore';

// Mock the bootstrap API
vi.mock('@/lib/server/bootstrap', () => ({
  loadBootstrapData: vi.fn().mockResolvedValue({
    user: {
      unit: 'metric',
      locale: 'he',
      lastLoginUtc: new Date().toISOString()
    },
    cities: [
      {
        id: 'city:31.8_35.2',
        name: { en: 'Jerusalem', he: 'ירושלים' },
        country: { en: 'Israel', he: 'ישראל' },
        lat: 31.7683,
        lon: 35.2137,
        isCurrentLocation: true,
        lastUpdatedUtc: new Date().toISOString(),
        current: {
          codeId: 800,
          temp: 22,
          feelsLike: 24,
          tempMin: 18,
          tempMax: 26,
          desc: 'Clear sky',
          icon: '01d',
          humidity: 50,
          wind: 5,
          windDeg: 180,
          pressure: 1013,
          visibility: 10000,
          clouds: 0,
          sunrise: 1640995200,
          sunset: 1641038400,
          timezone: 7200
        },
        forecast: [],
        hourly: []
      }
    ],
    currentCityId: 'city:31.8_35.2',
    serverTtlMinutes: 20
  })
}));

describe('Bootstrap Integration', () => {
  it('should load bootstrap data on page load', async () => {
    // Reset store state
    useWeatherStore.getState().resetStore();
    
    // Simulate page load with bootstrap data
    const bootstrapData = await import('@/lib/server/bootstrap').then(m => m.loadBootstrapData());
    
    if (bootstrapData) {
      useWeatherStore.getState().bootstrapLoad(bootstrapData);
    }
    
    const state = useWeatherStore.getState();
    
    expect(state.cities).toHaveLength(1);
    expect(state.cities[0].id).toBe('city:31.8_35.2');
    expect(state.cities[0].name.he).toBe('ירושלים');
    expect(state.currentIndex).toBe(0);
    expect(state.isAuthenticated).toBe(true);
  });

  it('should handle empty bootstrap data', async () => {
    // Reset store state
    useWeatherStore.getState().resetStore();
    
    // Simulate empty bootstrap data
    const emptyBootstrapData = null;
    
    if (emptyBootstrapData) {
      useWeatherStore.getState().bootstrapLoad(emptyBootstrapData);
    }
    
    const state = useWeatherStore.getState();
    
    expect(state.cities).toHaveLength(0);
    expect(state.isAuthenticated).toBe(false);
  });

  it('should handle bootstrap data with multiple cities', async () => {
    // Reset store state
    useWeatherStore.getState().resetStore();
    
    const multiCityBootstrapData = {
      user: {
        unit: 'metric' as const,
        locale: 'he' as const,
        lastLoginUtc: new Date().toISOString()
      },
      cities: [
        {
          id: 'city:31.8_35.2',
          name: { en: 'Jerusalem', he: 'ירושלים' },
          country: { en: 'Israel', he: 'ישראל' },
          lat: 31.7683,
          lon: 35.2137,
          isCurrentLocation: true,
          lastUpdatedUtc: new Date().toISOString(),
          current: { codeId: 800, temp: 22, feelsLike: 24, tempMin: 18, tempMax: 26, desc: 'Clear sky', icon: '01d', humidity: 50, wind: 5, windDeg: 180, pressure: 1013, visibility: 10000, clouds: 0, sunrise: 1640995200, sunset: 1641038400, timezone: 7200 },
          forecast: [],
          hourly: []
        },
        {
          id: 'city:32.1_34.8',
          name: { en: 'Tel Aviv', he: 'תל אביב' },
          country: { en: 'Israel', he: 'ישראל' },
          lat: 32.0853,
          lon: 34.7818,
          isCurrentLocation: false,
          lastUpdatedUtc: new Date().toISOString(),
          current: { codeId: 800, temp: 24, feelsLike: 26, tempMin: 20, tempMax: 28, desc: 'Clear sky', icon: '01d', humidity: 60, wind: 3, windDeg: 90, pressure: 1015, visibility: 10000, clouds: 0, sunrise: 1640995200, sunset: 1641038400, timezone: 7200 },
          forecast: [],
          hourly: []
        }
      ],
      currentCityId: 'city:32.1_34.8',
      serverTtlMinutes: 20
    };
    
    useWeatherStore.getState().bootstrapLoad(multiCityBootstrapData);
    
    const state = useWeatherStore.getState();
    
    expect(state.cities).toHaveLength(2);
    expect(state.currentIndex).toBe(1); // Should be on Tel Aviv
    expect(state.cities[1].name.he).toBe('תל אביב');
  });
});
