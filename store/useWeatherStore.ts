'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WeatherStore, WeatherStoreActions } from '@/types/store';
import { isCityExists } from '@/lib/helpers';
import { CityWeather } from '@/types/weather';
import { ToastMessage } from '@/types/ui';

let toastIdCounter = 0;

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
      open: false,
      maxCities: 15,
      setOpen: (open) => set({ open }),
      addCity: (city) => {
        if (get().cities.length >= get().maxCities) {
          get().showToast({
            message: 'toasts.maxCities',
            type: 'warning',
            values: { maxCities: get().maxCities.toString() }
          });
          return false;
        }
        const exists = isCityExists(get().cities, city);
        if (exists) {
          get().showToast({
            message: 'toasts.exists',
            type: 'info',
            values: { city: city.name[get().locale] }
          });
          return false;
        }
        set((state) => ({
          cities: [...state.cities, city],
          currentIndex: state.cities.length
        }));
        
        // Sync to server after adding city
        if (get().isAuthenticated) {
          setTimeout(() => {
            get().syncWithServer();
          }, 100); // Small delay to ensure state is updated
        }
        
        return true;
      },
      addOrReplaceCurrentLocation: (city) => {
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
            currentIndex: 0,
          };
        });
        
        // Sync to server after adding current location
        if (get().isAuthenticated) {
          setTimeout(() => {
            get().syncWithServer();
          }, 100); // Small delay to ensure state is updated
        }
      },
      updateCity: (city) => {
        const updated = get().cities.map((c) => (c.id === city.id ? city : c));
        set({ cities: updated });
      },
      removeCity: (id) => {
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
        });
        
        // Sync to server after removing city
        if (get().isAuthenticated) {
          setTimeout(() => {
            get().syncWithServer();
          }, 100); // Small delay to ensure state is updated
        }
      },
      refreshCity: (id) => {
        const updated = get().cities.map((c) => (c.id === id ? { ...c, lastUpdated: 0 } : c));
        set({ cities: updated });
      },
      setUnit: (unit) => set({ unit }),
      setLocale: (locale) => set({ locale }),
      setTheme: (theme) => set({ theme }),
      setCurrentIndex: (index) => set({ currentIndex: index }),

      showToast: ({ message, type = 'info', duration, values = {} }) => {
        toastIdCounter += 1;
        const id = toastIdCounter;
        const newToast: ToastMessage = {
          id,
          message,
          type,
          values,
          ...(duration && { duration })
        };

        set((state) => ({
          toasts: [...state.toasts, newToast],
        }));
      },

      hideToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },

      setIsLoading: (isLoading) => set({ isLoading }),

      nextCity: () => set({ currentIndex: (get().currentIndex + 1) % get().cities.length }),
      prevCity: () => set({ currentIndex: (get().currentIndex - 1 + get().cities.length) % get().cities.length }),
      setUserTimezoneOffset: (offset) => set({ userTimezoneOffset: offset }),
      getUserTimezoneOffset: () => get().userTimezoneOffset,
      resetStore: () => set({
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
        isAuthenticated: false,
        isSyncing: false,
      }),
      
      // Auth and Sync
      isAuthenticated: false,
      isSyncing: false,
      
      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      
      syncWithServer: async () => {
        // syncWithServer: called
        
        if (!get().isAuthenticated) {
          // syncWithServer: not authenticated, skipping
          return;
        }
        
        if (get().isSyncing) {
          // syncWithServer: already syncing, forcing reset and continuing
          set({ isSyncing: false });
        }
        
        // syncWithServer: starting sync
        
        // Don't set loading state for background sync
        // This prevents unnecessary UI loading states
        set({ isSyncing: true });
        
        try {
          const response = await fetch('/api/user/preferences', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              locale: get().locale,
              theme: get().theme,
              unit: get().unit,
              cities: get().cities,
            }),
          });
          
          // syncWithServer: response received
          
          if (!response.ok) {
            throw new Error('Failed to sync preferences');
          }
          
          // syncWithServer: sync completed successfully
        } catch {
          // syncWithServer: sync error
        } finally {
          // syncWithServer: setting isSyncing to false
          set({ isSyncing: false });
        }
      },
      
      loadUserPreferences: async (_forceLoad = false) => {
        // This function is now disabled - preferences are loaded via syncUserToDatabase
        // to avoid duplicate API calls on page refresh
        // Log only in development
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.log('loadUserPreferences called but disabled to prevent duplicate API calls');
        }
        return;
      },
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