import { useWeatherStore } from '@/stores/useWeatherStore';
import { vi } from 'vitest';
import { act } from 'react-dom/test-utils';
import { renderHook } from '@testing-library/react';

// mock isCityExists helper
vi.mock('@/lib/helpers', () => ({
  isCityExists: vi.fn(),
}));

import { isCityExists } from '@/lib/helpers';
import { CityWeather } from '@/types/weather';

const testCity: CityWeather = {
  id: '1',
  name: 'Tel Aviv',
  country: 'IL',
  lat: 32.07,
  lon: 34.79,
  current: {
    temp: 25,
    feelsLike: 25,
    desc: 'Sunny',
    icon: '01d',
    humidity: 50,
    pressure: 1000,
    visibility: 10000,
    wind: 5,
    windDeg: 90,
    clouds: 0,
    sunrise: 0,
    sunset: 0,
    timezone: 0
  },
  forecast: [],
  lastUpdated: 0,
  unit: 'metric',
  lang: 'he',
};

describe('useWeatherStore - addCity & removeCity', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        const { result } = renderHook(() => useWeatherStore());
        act(() => result.current.resetStore());
      });

  it('adds a city if it does not already exist and under max limit', () => {
    (isCityExists as any).mockReturnValue(false);
    const { result } = renderHook(() => useWeatherStore());

    act(() => {
      result.current.addCity(testCity);
    });

    expect(result.current.cities).toHaveLength(1);
    expect(result.current.cities[0].name).toBe('Tel Aviv');
    expect(result.current.currentIndex).toBe(0);
  });

  it('shows toast if city already exists', () => {
    (isCityExists as any).mockReturnValue(true);
    const { result } = renderHook(() => useWeatherStore());

    act(() => {
      result.current.addCity(testCity);
    });

    expect(result.current.toasts[0]?.message).toBe('toasts.exists');
  });

  it('does not add more than 15 cities', () => {
    (isCityExists as any).mockReturnValue(false);
    const { result } = renderHook(() => useWeatherStore());

    act(() => {
      for (let i = 0; i < 15; i++) {
        result.current.addCity({ ...testCity, id: String(i) });
      }
      result.current.addCity({ ...testCity, id: 'overflow' });
    });

    expect(result.current.cities).toHaveLength(15);
    expect(result.current.toasts.at(-1)?.message).toBe('toasts.maxCities');
  });

  it('removes a city and updates currentIndex', () => {
    (isCityExists as any).mockReturnValue(false);
    const { result } = renderHook(() => useWeatherStore());

    act(() => {
      result.current.addCity({ ...testCity, id: '1' });
      result.current.addCity({ ...testCity, id: '2', name: 'Haifa' });
    });

    expect(result.current.cities).toHaveLength(2);
    expect(result.current.currentIndex).toBe(1);

    act(() => {
      result.current.removeCity('2');
    });

    expect(result.current.cities).toHaveLength(1);
    expect(result.current.cities[0].id).toBe('1');
    expect(result.current.currentIndex).toBe(0);
  });
});