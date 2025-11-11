'use client';

import { create } from 'zustand';

import type { CityWeather } from '@/types/weather';
import type { WeatherCurrent, WeatherForecastItem, WeatherHourlyItem } from '@/types/weather';

interface LoadFromServerPayload {
  cities: Array<{
    id: string;
    lat: number;
    lon: number;
    name: { en: string; he: string };
    country: { en: string; he: string };
    isCurrentLocation?: boolean;
    lastUpdatedUtc: string;
    current: WeatherCurrent;
    forecast: WeatherForecastItem[];
    hourly: WeatherHourlyItem[];
  }>;
  currentCityId?: string;
}

interface WeatherDataState {
  cities: CityWeather[];
  currentIndex: number;
  autoLocationCityId?: string;
  isLoading: boolean;
  maxCities: number;
}

interface WeatherDataActions {
  setCities: (cities: CityWeather[]) => void;
  addCity: (city: CityWeather) => void;
  addOrReplaceCurrentLocation: (city: CityWeather) => void;
  updateCity: (city: CityWeather) => void;
  removeCity: (id: string) => void;
  setCurrentIndex: (index: number) => void;
  setCurrentCity: (id: string) => void;
  nextCity: () => void;
  prevCity: () => void;
  setAutoLocationCityId: (id?: string) => void;
  setIsLoading: (value: boolean) => void;
  resetWeatherState: () => void;
  loadFromServer: (payload: LoadFromServerPayload) => void;
  applyBackgroundUpdate: (id: string, data: Partial<CityWeather> & { lastUpdatedUtc?: string }) => void;
}

export type WeatherDataStore = WeatherDataState & WeatherDataActions;

const MAX_CITIES = 15;

export const useWeatherDataStore = create<WeatherDataStore>((set, get) => ({
  cities: [],
  currentIndex: 0,
  autoLocationCityId: undefined,
  isLoading: false,
  maxCities: MAX_CITIES,
  setCities: (cities) =>
    set({
      cities,
      currentIndex: Math.min(get().currentIndex, Math.max(0, cities.length - 1)),
    }),
  addCity: (city) =>
    set((state) => {
      const filtered = state.cities.filter((existing) => existing.id !== city.id);
      return {
        cities: [...filtered, city],
        currentIndex: filtered.length,
      };
    }),
  addOrReplaceCurrentLocation: (city) =>
    set((state) => {
      const filtered = state.cities.filter((existing) => existing.id !== city.id && existing.id !== state.autoLocationCityId);
      const updatedCity: CityWeather = {
        ...city,
        isCurrentLocation: true,
      };
      return {
        cities: [updatedCity, ...filtered],
        currentIndex: 0,
        autoLocationCityId: updatedCity.id,
      };
    }),
  updateCity: (city) =>
    set((state) => ({
      cities: state.cities.map((existing) => (existing.id === city.id ? city : existing)),
    })),
  removeCity: (id) =>
    set((state) => {
      const filtered = state.cities.filter((city) => city.id !== id);
      const removedIndex = state.cities.findIndex((city) => city.id === id);
      let nextIndex = state.currentIndex;

      if (removedIndex === state.currentIndex) {
        nextIndex = Math.max(0, state.currentIndex - 1);
      } else if (removedIndex < state.currentIndex) {
        nextIndex = Math.max(0, state.currentIndex - 1);
      }

      if (filtered.length === 0) {
        nextIndex = 0;
      }

      return {
        cities: filtered,
        currentIndex: nextIndex,
        autoLocationCityId: id === state.autoLocationCityId ? undefined : state.autoLocationCityId,
      };
    }),
  setCurrentIndex: (index) => {
    const cities = get().cities;
    if (cities.length === 0) {
      set({ currentIndex: 0 });
      return;
    }
    const boundedIndex = ((index % cities.length) + cities.length) % cities.length;
    set({ currentIndex: boundedIndex });
  },
  setCurrentCity: (id) => {
    const index = get().cities.findIndex((city) => city.id === id);
    if (index !== -1) {
      set({ currentIndex: index });
    }
  },
  nextCity: () => {
    const { currentIndex, cities } = get();
    if (cities.length === 0) return;
    set({ currentIndex: (currentIndex + 1) % cities.length });
  },
  prevCity: () => {
    const { currentIndex, cities } = get();
    if (cities.length === 0) return;
    set({ currentIndex: (currentIndex - 1 + cities.length) % cities.length });
  },
  setAutoLocationCityId: (id) => set({ autoLocationCityId: id }),
  setIsLoading: (value) => set({ isLoading: value }),
  resetWeatherState: () =>
    set({
      cities: [],
      currentIndex: 0,
      autoLocationCityId: undefined,
      isLoading: false,
      maxCities: MAX_CITIES,
    }),
  loadFromServer: (payload) => {
    const mappedCities: CityWeather[] = payload.cities.map((city) => ({
      id: city.id,
      lat: city.lat,
      lon: city.lon,
      name: city.name,
      country: city.country,
      isCurrentLocation: Boolean(city.isCurrentLocation),
      lastUpdated: new Date(city.lastUpdatedUtc).getTime(),
      current: city.current,
      forecast: city.forecast,
      hourly: city.hourly,
      unit: 'metric',
    }));

    const currentIndex =
      payload.currentCityId !== undefined ? mappedCities.findIndex((city) => city.id === payload.currentCityId) : 0;

    const autoId =
      payload.currentCityId ||
      mappedCities.find((city) => city.isCurrentLocation)?.id ||
      undefined;

    set({
      cities: mappedCities,
      currentIndex: Math.max(0, currentIndex),
      autoLocationCityId: autoId,
    });
  },
  applyBackgroundUpdate: (id, data) =>
    set((state) => {
      const existingCity = state.cities.find((city) => city.id === id);
      if (!existingCity) return {};

      const lastUpdated =
        data.lastUpdatedUtc !== undefined ? new Date(data.lastUpdatedUtc).getTime() : data.lastUpdated ?? existingCity.lastUpdated;

      const updatedCity: CityWeather = {
        ...existingCity,
        ...data,
        lastUpdated,
      };

      return {
        cities: state.cities.map((city) => (city.id === id ? updatedCity : city)),
      };
    }),
}));


