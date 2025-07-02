'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WeatherStore, WeatherStoreActions } from '@/types/store';
import { isCityExists } from '@/lib/helpers';
import { CityWeather } from '@/types/weather';

let toastIdCounter = 0;
const toastTimeouts: Record<number, ReturnType<typeof setTimeout>> = {};

export const useWeatherStore = create<WeatherStore & WeatherStoreActions>()(
  persist(
    (set, get) => ({
      cities: [],
      currentIndex: 0,
      unit: 'metric',
      locale: 'he',
      theme: 'system',
      direction: 'ltr',
      toasts: [],
      isLoading: false,
      autoLocationCityId: undefined,
      userTimezoneOffset: -new Date().getTimezoneOffset() * 60,

      addCity: (city) => {
        if (get().cities.length >= 15) {
          get().showToast({
            message: 'toasts.maxCities',
            values: { maxCities: 15 }
          });
          return;
        }
        const exists = isCityExists(get().cities, city);
        if (exists) {
          get().showToast({
            message: 'toasts.exists',
            values: { name: city.name }
          });
          return;
        }
        set((state) => ({
          cities: [...state.cities, city],
          currentIndex: state.cities.length
        }));
      },
      addOrReplaceCurrentLocation: (city) =>
        set((state) => {

          const alreadyExists = isCityExists(state.cities, city);
          const isAlreadyCurrent = city.isCurrentLocation;

          if (alreadyExists && !isAlreadyCurrent) {
            return state;
          }

          const filteredCities = state.autoLocationCityId
            ? state.cities.filter((c) => c.id !== state.autoLocationCityId)
            : state.cities;

          const updatedCity: CityWeather = {
            ...city,
            isCurrentLocation: true,
          };

          return {
            cities: [updatedCity, ...filteredCities],
            autoLocationCityId: updatedCity.id,
          };
        }),
      updateCity: (city) => {
        const updated = get().cities.map((c) => (c.id === city.id ? city : c));
        set({ cities: updated });
      },
      removeCity: (id) =>
        set((state) => {
          const newCities = state.cities.filter((c) => c.id !== id);
          const currentIndex = state.cities.findIndex((c) => c.id === id);
          const isCurrentCity = currentIndex === state.currentIndex;

          let newIndex = state.currentIndex;
          if (isCurrentCity) {
            newIndex = Math.max(0, state.currentIndex - 1);
          } else if (state.currentIndex > currentIndex) {
            newIndex = state.currentIndex - 1;
          }

          if (newCities.length === 0) {
            newIndex = 0;
          }

          return {
            cities: newCities,
            currentIndex: newIndex,
            autoLocationCityId: id === state.autoLocationCityId ? undefined : state.autoLocationCityId,
          };
        }),
      refreshCity: (id) => {
        const updated = get().cities.map((c) => (c.id === id ? { ...c, lastUpdated: 0 } : c));
        set({ cities: updated });
      },
      setUnit: (unit) => set({ unit }),
      setLocale: (locale) => set({ locale }),
      setTheme: (theme) => set({ theme }),
      setCurrentIndex: (index) => set({ currentIndex: index }),

      showToast: ({ message, values = {} }) => {
        toastIdCounter += 1;
        const id = toastIdCounter;
        set((state) => ({
          toasts: [...state.toasts, { id, message, values }],
        }));
      },
      hideToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },

      setIsLoading: (isLoading) => set({ isLoading }),

      clearAllToastTimeouts: () => {
        Object.values(toastTimeouts).forEach(clearTimeout);
        for (const id in toastTimeouts) {
          delete toastTimeouts[+id];
        }
      },
      nextCity: () => set({ currentIndex: (get().currentIndex + 1) % get().cities.length }),
      prevCity: () => set({ currentIndex: (get().currentIndex - 1 + get().cities.length) % get().cities.length }),
      setUserTimezoneOffset: (offset) => set({ userTimezoneOffset: offset }),
      getUserTimezoneOffset: () => get().userTimezoneOffset,
      resetStore: () => set({ cities: [], currentIndex: 0, unit: 'metric', locale: 'he', theme: 'system', direction: 'ltr', toasts: [], isLoading: false, autoLocationCityId: undefined, userTimezoneOffset: -new Date().getTimezoneOffset() * 60 }),
    }),
    {
      name: 'weather-store',
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !['isLoading'].includes(key))
        ) as WeatherStore,
    },
  ),
);
