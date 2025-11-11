import { describe, it, expect } from 'vitest';
import { useWeatherStore } from '@/store/useWeatherStore';

describe('Store Reducers', () => {
  const mockBootstrapPayload = {
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
  };

  it('should load bootstrap data correctly', () => {
    const store = useWeatherStore.getState();
    
    // Test bootstrapLoad function
    store.bootstrapLoad(mockBootstrapPayload);
    
    const state = useWeatherStore.getState();
    expect(state.cities).toHaveLength(1);
    expect(state.cities[0].id).toBe('city:31.8_35.2');
    expect(state.cities[0].name.en).toBe('Jerusalem');
    expect(state.cities[0].name.he).toBe('ירושלים');
    expect(state.currentIndex).toBe(0);
    expect(state.locale).toBe('he');
    expect(state.unit).toBe('metric');
    expect(state.isAuthenticated).toBe(true);
  });

  it('should set current city correctly', () => {
    const store = useWeatherStore.getState();
    
    // Add multiple cities
    store.bootstrapLoad({
      ...mockBootstrapPayload,
      cities: [
        ...mockBootstrapPayload.cities,
        {
          ...mockBootstrapPayload.cities[0],
          id: 'city:32.1_34.8',
          name: { en: 'Tel Aviv', he: 'תל אביב' },
          isCurrentLocation: false
        }
      ]
    });
    
    // Set current city to second city
    store.setCurrentCity('city:32.1_34.8');
    
    const state = useWeatherStore.getState();
    expect(state.currentIndex).toBe(1);
  });

  it('should apply background update correctly', () => {
    const store = useWeatherStore.getState();
    
    // Load initial data
    store.bootstrapLoad(mockBootstrapPayload);
    
    // Apply background update
    const updatedData = {
      ...mockBootstrapPayload.cities[0],
      current: {
        ...mockBootstrapPayload.cities[0].current,
        temp: 25 // Updated temperature
      },
      lastUpdatedUtc: new Date(Date.now() + 1000).toISOString()
    };
    
    store.applyBackgroundUpdate('city:31.8_35.2', updatedData);
    
    const state = useWeatherStore.getState();
    const updatedCity = state.cities.find(c => c.id === 'city:31.8_35.2');
    expect(updatedCity?.current.temp).toBe(25);
  });

  it('should handle refresh city without breaking other cities', () => {
    const store = useWeatherStore.getState();
    
    // Load multiple cities
    store.bootstrapLoad({
      ...mockBootstrapPayload,
      cities: [
        mockBootstrapPayload.cities[0],
        {
          ...mockBootstrapPayload.cities[0],
          id: 'city:32.1_34.8',
          name: { en: 'Tel Aviv', he: 'תל אביב' },
          isCurrentLocation: false
        }
      ]
    });
    
    const initialState = useWeatherStore.getState();
    const firstCity = initialState.cities[0];
    const secondCity = initialState.cities[1];
    
    // Refresh first city
    store.refreshCity('city:31.8_35.2', { background: true });
    
    const state = useWeatherStore.getState();
    
    // Second city should remain unchanged
    expect(state.cities[1]).toEqual(secondCity);
  });
});
