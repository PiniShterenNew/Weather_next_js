import { beforeEach, describe, expect, it } from 'vitest';

import { useWeatherDataStore } from '@/features/weather/store/useWeatherDataStore';
import type { CityWeather } from '@/types/weather';

const resetStore = () => {
  useWeatherDataStore.setState({
    cities: [],
    currentIndex: 0,
    autoLocationCityId: undefined,
    isLoading: false,
    maxCities: 15,
  });
};

const createCity = (id: string, overrides: Partial<CityWeather> = {}): CityWeather => ({
  id,
  lat: 10,
  lon: 20,
  name: { en: `City ${id}`, he: `עיר ${id}` },
  country: { en: 'Country', he: 'מדינה' },
  isCurrentLocation: false,
  current: {
    codeId: 800,
    temp: 25,
    feelsLike: 26,
    tempMin: 20,
    tempMax: 28,
    desc: 'Clear',
    icon: '01d',
    humidity: 40,
    wind: 10,
    windDeg: 180,
    pressure: 1015,
    visibility: 10000,
    clouds: 0,
    sunrise: null,
    sunset: null,
    timezone: 'UTC',
    uvIndex: null,
    rainProbability: null,
  },
  forecast: [],
  hourly: [],
  lastUpdated: Date.now(),
  unit: 'metric',
  ...overrides,
});

describe('useWeatherDataStore', () => {
  beforeEach(() => {
    resetStore();
  });

  it('adds and updates cities', () => {
    const { addCity, updateCity, cities } = useWeatherDataStore.getState();

    const cityA = createCity('a');
    addCity(cityA);
    expect(useWeatherDataStore.getState().cities).toEqual([cityA]);
    expect(useWeatherDataStore.getState().currentIndex).toBe(0);

    const updatedCityA = { ...cityA, current: { ...cityA.current, temp: 30 } };
    updateCity(updatedCityA);
    expect(useWeatherDataStore.getState().cities[0]).toEqual(updatedCityA);
    expect(cities).toBeDefined();
  });

  it('removes cities and adjusts index', () => {
    const { addCity, removeCity, setCurrentIndex } = useWeatherDataStore.getState();
    const cityA = createCity('a');
    const cityB = createCity('b');
    addCity(cityA);
    addCity(cityB);

    setCurrentIndex(1);
    removeCity('b');

    expect(useWeatherDataStore.getState().cities).toHaveLength(1);
    expect(useWeatherDataStore.getState().currentIndex).toBe(0);
  });

  it('cycles through cities with next/prev', () => {
    const { addCity, nextCity, prevCity, setCurrentIndex } = useWeatherDataStore.getState();
    addCity(createCity('a'));
    addCity(createCity('b'));

    setCurrentIndex(0);

    nextCity();
    expect(useWeatherDataStore.getState().currentIndex).toBe(1);

    prevCity();
    expect(useWeatherDataStore.getState().currentIndex).toBe(0);
  });

  it('loads cities from server payload', () => {
    const { loadFromServer } = useWeatherDataStore.getState();

    loadFromServer({
      cities: [
        {
          id: 'server-1',
          lat: 1,
          lon: 2,
          name: { en: 'Server City', he: 'עיר שרת' },
          country: { en: 'Country', he: 'מדינה' },
          isCurrentLocation: true,
          lastUpdatedUtc: new Date().toISOString(),
          current: createCity('server-1').current,
          forecast: [],
          hourly: [],
        },
      ],
      currentCityId: 'server-1',
    });

    const state = useWeatherDataStore.getState();
    expect(state.cities).toHaveLength(1);
    expect(state.autoLocationCityId).toBe('server-1');
    expect(state.currentIndex).toBe(0);
  });
});
