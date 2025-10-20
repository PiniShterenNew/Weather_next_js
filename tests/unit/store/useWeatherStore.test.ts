import { useWeatherStore } from '@/store/useWeatherStore';
import { vi } from 'vitest';
import { act } from 'react';
import { renderHook } from '@testing-library/react';

// mock isCityExists helper
vi.mock('@/lib/helpers', () => ({
  isCityExists: vi.fn(),
}));

import { isCityExists } from '@/lib/helpers';
import { CityWeather } from '@/types/weather';

const createTestCity = (overrides = {}): CityWeather => ({
  id: '1',
  name: { en: 'Tel Aviv', he: 'תל אביב' },
  country: { en: 'Israel', he: 'ישראל' },
  lat: 32.07,
  lon: 34.79,
  currentEn: {
    lat: 32.07,
    lon: 34.79,
    current: {
      codeId: 800,
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
    unit: 'metric'
  },
  currentHe: {
    lat: 32.07,
    lon: 34.79,
    current: {
      codeId: 800,
      temp: 25,
      feelsLike: 25,
      desc: 'שמש',
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
    unit: 'metric'
  },
  lastUpdated: 0,
  ...overrides,
});

const createCurrentLocationCity = (overrides = {}): CityWeather => ({
  ...createTestCity(),
  id: 'current-location',
  isCurrentLocation: true,
  ...overrides,
});

describe('useWeatherStore', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Reset the store state before each test
    const { result } = renderHook(() => useWeatherStore());
    act(() => {
      result.current.resetStore();
    });
  });

  describe('Initial State', () => {
    it('has correct initial state', () => {
      const { result } = renderHook(() => useWeatherStore());

      expect(result.current.cities).toEqual([]);
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.unit).toBe('metric');
      expect(result.current.locale).toBe('he');
      expect(result.current.theme).toBe('system');
      expect(result.current.direction).toBe('ltr');
      expect(result.current.toasts).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.autoLocationCityId).toBeUndefined();
      expect(result.current.open).toBe(false);
      expect(result.current.maxCities).toBe(15);
    });

    it('has correct timezone offset', () => {
      const { result } = renderHook(() => useWeatherStore());
      const expectedOffset = -new Date().getTimezoneOffset() * 60;
      expect(result.current.userTimezoneOffset).toBe(expectedOffset);
    });
  });

  describe('addCity', () => {
    it('adds a city if it does not exist and under max limit', () => {
      (isCityExists as any).mockReturnValue(false);
      const { result } = renderHook(() => useWeatherStore());
      const testCity = createTestCity();

      act(() => {
        result.current.addCity(testCity);
      });

      expect(result.current.cities).toHaveLength(1);
      expect(result.current.cities[0]).toEqual(testCity);
      expect(result.current.currentIndex).toBe(0); // Should be index of new city
    });

    it('shows toast if city already exists', () => {
      (isCityExists as any).mockReturnValue(true);
      const { result } = renderHook(() => useWeatherStore());
      const testCity = createTestCity();

      act(() => {
        result.current.addCity(testCity);
      });

      expect(result.current.cities).toHaveLength(0);
      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].message).toBe('toasts.exists');
      expect(result.current.toasts[0].type).toBe('info');
      expect(result.current.toasts[0].values?.city).toBe('תל אביב');
    });

    it('shows toast if max cities reached', () => {
      (isCityExists as any).mockReturnValue(false);
      const { result } = renderHook(() => useWeatherStore());

      // Add 15 cities (max limit)
      act(() => {
        for (let i = 0; i < 15; i++) {
          result.current.addCity(createTestCity({ id: String(i), name: { en: `City ${i}`, he: `עיר ${i}` } }));
        }
      });

      expect(result.current.cities).toHaveLength(15);

      // Try to add 16th city
      act(() => {
        result.current.addCity(createTestCity({ id: 'overflow' }));
      });

      expect(result.current.cities).toHaveLength(15);
      expect(result.current.toasts.at(-1)?.message).toBe('toasts.maxCities');
      expect(result.current.toasts.at(-1)?.type).toBe('warning');
      expect(result.current.toasts.at(-1)?.values?.maxCities).toBe('15');
    });

    it('updates currentIndex correctly when adding cities', () => {
      (isCityExists as any).mockReturnValue(false);
      const { result } = renderHook(() => useWeatherStore());

      act(() => {
        result.current.addCity(createTestCity({ id: '1' }));
      });
      expect(result.current.currentIndex).toBe(0);

      act(() => {
        result.current.addCity(createTestCity({ id: '2' }));
      });
      expect(result.current.currentIndex).toBe(1);
    });
  });

  describe('addOrReplaceCurrentLocation', () => {
    it('adds current location city when none exists', () => {
      const { result } = renderHook(() => useWeatherStore());
      const currentLocationCity = createCurrentLocationCity();

      act(() => {
        result.current.addOrReplaceCurrentLocation(currentLocationCity);
      });

      expect(result.current.cities).toHaveLength(1);
      expect(result.current.cities[0].isCurrentLocation).toBe(true);
      expect(result.current.autoLocationCityId).toBe('current-location');
      expect(result.current.currentIndex).toBe(0);
    });

    it('replaces existing current location city', () => {
      (isCityExists as any).mockReturnValue(false);
      const { result } = renderHook(() => useWeatherStore());
      const oldCurrentLocation = createCurrentLocationCity({ id: 'old-current' });
      const newCurrentLocation = createCurrentLocationCity({ id: 'new-current' });
      const regularCity = createTestCity({ id: 'regular' });

      // Add old current location and regular city
      act(() => {
        result.current.addOrReplaceCurrentLocation(oldCurrentLocation);
        result.current.addCity(regularCity);
      });

      expect(result.current.cities).toHaveLength(2);
      expect(result.current.autoLocationCityId).toBe('old-current');

      // Replace with new current location
      act(() => {
        result.current.addOrReplaceCurrentLocation(newCurrentLocation);
      });

      expect(result.current.cities).toHaveLength(2);
      expect(result.current.cities[0].id).toBe('new-current');
      expect(result.current.cities[1].id).toBe('regular');
      expect(result.current.autoLocationCityId).toBe('new-current');
      expect(result.current.currentIndex).toBe(0);
    });

    it('does not add duplicate if already exists and not current location', () => {
      (isCityExists as any).mockReturnValue(true);
      const { result } = renderHook(() => useWeatherStore());
      const city = createTestCity();
      city.isCurrentLocation = false;

      act(() => {
        result.current.addOrReplaceCurrentLocation(city);
      });

      expect(result.current.cities).toHaveLength(0);
    });
  });

  describe('removeCity', () => {
    beforeEach(() => {
      (isCityExists as any).mockReturnValue(false);
    });

    it('removes a city and updates indices correctly', () => {
      const { result } = renderHook(() => useWeatherStore());
      const city1 = createTestCity({ id: '1' });
      const city2 = createTestCity({ id: '2' });
      const city3 = createTestCity({ id: '3' });

      act(() => {
        result.current.addCity(city1);
        result.current.addCity(city2);
        result.current.addCity(city3);
        result.current.setCurrentIndex(1); // Set to middle city
      });

      expect(result.current.cities).toHaveLength(3);
      expect(result.current.currentIndex).toBe(1);

      // Remove the current city
      act(() => {
        result.current.removeCity('2');
      });

      expect(result.current.cities).toHaveLength(2);
      expect(result.current.currentIndex).toBe(0); // Should move to previous index
    });

    it('adjusts currentIndex when removing city before current', () => {
      const { result } = renderHook(() => useWeatherStore());
      const city1 = createTestCity({ id: '1' });
      const city2 = createTestCity({ id: '2' });
      const city3 = createTestCity({ id: '3' });

      act(() => {
        result.current.addCity(city1);
        result.current.addCity(city2);
        result.current.addCity(city3);
        result.current.setCurrentIndex(2); // Set to last city
      });

      // Remove first city
      act(() => {
        result.current.removeCity('1');
      });

      expect(result.current.cities).toHaveLength(2);
      expect(result.current.currentIndex).toBe(1); // Should decrement
    });

    it('resets currentIndex to 0 when all cities removed', () => {
      const { result } = renderHook(() => useWeatherStore());
      const city = createTestCity();

      act(() => {
        result.current.addCity(city);
        result.current.removeCity(city.id);
      });

      expect(result.current.cities).toHaveLength(0);
      expect(result.current.currentIndex).toBe(0);
    });

    it('clears autoLocationCityId when removing current location', () => {
      const { result } = renderHook(() => useWeatherStore());
      const currentLocationCity = createCurrentLocationCity();

      act(() => {
        result.current.addOrReplaceCurrentLocation(currentLocationCity);
      });

      expect(result.current.autoLocationCityId).toBe('current-location');

      act(() => {
        result.current.removeCity('current-location');
      });

      expect(result.current.autoLocationCityId).toBeUndefined();
    });
  });

  describe('updateCity', () => {
    it('updates an existing city', () => {
      (isCityExists as any).mockReturnValue(false);
      const { result } = renderHook(() => useWeatherStore());
      const originalCity = createTestCity();
      const updatedCity = {
        ...originalCity,
        currentEn: {
          ...originalCity.currentEn,
          current: { ...originalCity.currentEn.current, temp: 30 }
        }
      };

      act(() => {
        result.current.addCity(originalCity);
        result.current.updateCity(updatedCity);
      });

      expect(result.current.cities[0].currentEn.current.temp).toBe(30);
    });

    it('does not change cities array if city not found', () => {
      (isCityExists as any).mockReturnValue(false);
      const { result } = renderHook(() => useWeatherStore());
      const city = createTestCity();
      const nonExistentCity = createTestCity({ id: 'non-existent' });

      act(() => {
        result.current.addCity(city);
        result.current.updateCity(nonExistentCity);
      });

      expect(result.current.cities).toHaveLength(1);
      expect(result.current.cities[0].id).toBe('1');
    });
  });

  describe('refreshCity', () => {
    it('resets lastUpdated to 0 for specified city', () => {
      (isCityExists as any).mockReturnValue(false);
      const { result } = renderHook(() => useWeatherStore());
      const city = createTestCity({ lastUpdated: 1647847200000 });

      act(() => {
        result.current.addCity(city);
        result.current.refreshCity(city.id);
      });

      expect(result.current.cities[0].lastUpdated).toBe(0);
    });
  });

  describe('Navigation methods', () => {
    beforeEach(() => {
      (isCityExists as any).mockReturnValue(false);
    });

    it('navigates to next city correctly', () => {
      const { result } = renderHook(() => useWeatherStore());
      const cities = [
        createTestCity({ id: '1' }),
        createTestCity({ id: '2' }),
        createTestCity({ id: '3' }),
      ];

      act(() => {
        cities.forEach(city => result.current.addCity(city));
        result.current.setCurrentIndex(0);
      });

      expect(result.current.currentIndex).toBe(0);

      act(() => result.current.nextCity());
      expect(result.current.currentIndex).toBe(1);

      act(() => result.current.nextCity());
      expect(result.current.currentIndex).toBe(2);

      // Should wrap to beginning
      act(() => result.current.nextCity());
      expect(result.current.currentIndex).toBe(0);
    });

    it('navigates to previous city correctly', () => {
      const { result } = renderHook(() => useWeatherStore());
      const cities = [
        createTestCity({ id: '1' }),
        createTestCity({ id: '2' }),
        createTestCity({ id: '3' }),
      ];

      act(() => {
        cities.forEach(city => result.current.addCity(city));
        result.current.setCurrentIndex(2);
      });

      act(() => result.current.prevCity());
      expect(result.current.currentIndex).toBe(1);

      act(() => result.current.prevCity());
      expect(result.current.currentIndex).toBe(0);

      // Should wrap to end
      act(() => result.current.prevCity());
      expect(result.current.currentIndex).toBe(2);
    });

    it('handles navigation with single city', () => {
      const { result } = renderHook(() => useWeatherStore());

      act(() => {
        result.current.addCity(createTestCity());
      });

      act(() => result.current.nextCity());
      expect(result.current.currentIndex).toBe(0);

      act(() => result.current.prevCity());
      expect(result.current.currentIndex).toBe(0);
    });
  });

  describe('Toast management', () => {
    it('shows toast with correct properties', () => {
      const { result } = renderHook(() => useWeatherStore());

      act(() => {
        result.current.showToast({
          message: 'test.message',
          type: 'success',
          values: { test: 'value' },
          duration: 5000
        });
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0]).toMatchObject({
        id: expect.any(Number),
        message: 'test.message',
        type: 'success',
        values: { test: 'value' },
        duration: 5000
      });
    });

    it('shows toast with default type when not specified', () => {
      const { result } = renderHook(() => useWeatherStore());

      act(() => {
        result.current.showToast({ message: 'test.message' });
      });

      expect(result.current.toasts[0].type).toBe('info');
      expect(result.current.toasts[0].values).toEqual({});
    });

    it('assigns unique IDs to toasts', () => {
      const { result } = renderHook(() => useWeatherStore());

      act(() => {
        result.current.showToast({ message: 'first' });
        result.current.showToast({ message: 'second' });
      });

      expect(result.current.toasts).toHaveLength(2);
      expect(result.current.toasts[0].id).not.toBe(result.current.toasts[1].id);
    });

    it('hides toast by ID', () => {
      const { result } = renderHook(() => useWeatherStore());

      act(() => {
        result.current.showToast({ message: 'first' });
        result.current.showToast({ message: 'second' });
      });

      const firstToastId = result.current.toasts[0].id;

      act(() => {
        result.current.hideToast(firstToastId);
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].message).toBe('second');
    });
  });

  describe('Settings', () => {
    it('updates unit setting', () => {
      const { result } = renderHook(() => useWeatherStore());

      act(() => result.current.setUnit('imperial'));
      expect(result.current.unit).toBe('imperial');
    });

    it('updates locale setting', () => {
      const { result } = renderHook(() => useWeatherStore());

      act(() => result.current.setLocale('en'));
      expect(result.current.locale).toBe('en');
    });

    it('updates theme setting', () => {
      const { result } = renderHook(() => useWeatherStore());

      act(() => result.current.setTheme('dark'));
      expect(result.current.theme).toBe('dark');
    });

    it('updates currentIndex', () => {
      const { result } = renderHook(() => useWeatherStore());

      act(() => result.current.setCurrentIndex(5));
      expect(result.current.currentIndex).toBe(5);
    });

    it('updates isLoading state', () => {
      const { result } = renderHook(() => useWeatherStore());

      act(() => result.current.setIsLoading(true));
      expect(result.current.isLoading).toBe(true);
    });

    it('updates open state', () => {
      const { result } = renderHook(() => useWeatherStore());

      act(() => result.current.setOpen(true));
      expect(result.current.open).toBe(true);
    });

    it('updates user timezone offset', () => {
      const { result } = renderHook(() => useWeatherStore());

      act(() => result.current.setUserTimezoneOffset(7200));
      expect(result.current.userTimezoneOffset).toBe(7200);
      expect(result.current.getUserTimezoneOffset()).toBe(7200);
    });
  });

  describe('resetStore', () => {
    it('resets all state to initial values', () => {
      (isCityExists as any).mockReturnValue(false);
      const { result } = renderHook(() => useWeatherStore());

      // Change some state
      act(() => {
        result.current.addCity(createTestCity());
        result.current.setUnit('imperial');
        result.current.setLocale('en');
        result.current.setTheme('dark');
        result.current.setIsLoading(true);
        result.current.showToast({ message: 'test' });
      });

      // Verify state is changed
      expect(result.current.cities).toHaveLength(1);
      expect(result.current.unit).toBe('imperial');
      expect(result.current.toasts).toHaveLength(1);

      // Reset
      act(() => result.current.resetStore());

      // Verify reset
      expect(result.current.cities).toEqual([]);
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.unit).toBe('metric');
      expect(result.current.locale).toBe('he');
      expect(result.current.theme).toBe('system');
      expect(result.current.toasts).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.autoLocationCityId).toBeUndefined();
    });
  });

  describe('Edge cases', () => {
    it('handles empty cities array navigation', () => {
      const { result } = renderHook(() => useWeatherStore());

      act(() => result.current.nextCity());
      expect(result.current.currentIndex).toBe(NaN);

      act(() => result.current.prevCity());
      expect(result.current.currentIndex).toBe(NaN);
    });

    it('handles removing non-existent city', () => {
      const { result } = renderHook(() => useWeatherStore());
      const originalLength = result.current.cities.length;

      act(() => result.current.removeCity('non-existent'));

      expect(result.current.cities).toHaveLength(originalLength);
    });

    it('handles updating non-existent city', () => {
      const { result } = renderHook(() => useWeatherStore());
      const nonExistentCity = createTestCity({ id: 'non-existent' });
      const originalLength = result.current.cities.length;

      act(() => result.current.updateCity(nonExistentCity));

      expect(result.current.cities).toHaveLength(originalLength);
    });

    it('handles refreshing non-existent city', () => {
      const { result } = renderHook(() => useWeatherStore());

      act(() => result.current.refreshCity('non-existent'));
      // Should not throw error
    });

    it('handles hiding non-existent toast', () => {
      const { result } = renderHook(() => useWeatherStore());
      const originalLength = result.current.toasts.length;

      act(() => result.current.hideToast(999));

      expect(result.current.toasts).toHaveLength(originalLength);
    });
  });
});