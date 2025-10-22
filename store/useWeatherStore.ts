'use client';

import { create } from 'zustand';
import type { WeatherStore, WeatherStoreActions } from '@/types/store';
import { isCityExists } from '@/lib/helpers';
import { CityWeather } from '@/types/weather';
import { ToastMessage } from '@/types/ui';
import { locationService } from '@/features/location/services/locationService';

let toastIdCounter = 0;

export const useWeatherStore = create<WeatherStore & WeatherStoreActions>()(
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
      currentLocationData: undefined,
      locationTrackingEnabled: false,
      locationChangeDialog: {
        isOpen: false,
        oldCity: undefined,
        newCity: undefined,
        distance: undefined,
      },
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
        set((state) => {
          // Remove any duplicates before adding
          const filteredCities = state.cities.filter((c) => c.id !== city.id);
          return {
            cities: [...filteredCities, city],
            currentIndex: filteredCities.length
          };
        });
        
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

          // Remove any existing current location city and any duplicates
          const filteredCities = state.cities.filter((c) => 
            c.id !== state.autoLocationCityId && c.id !== city.id
          );

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

      updateCurrentLocation: (lat, lon, cityId) => {
        set({
          currentLocationData: {
            lat,
            lon,
            cityId,
            lastChecked: Date.now(),
          },
        });
      },

      setLocationTrackingEnabled: (enabled) => {
        set({ locationTrackingEnabled: enabled });
      },

      showLocationChangeDialog: (oldCity, newCity, distance) => {
        set({
          locationChangeDialog: {
            isOpen: true,
            oldCity,
            newCity,
            distance,
          },
        });
      },

      hideLocationChangeDialog: () => {
        set({
          locationChangeDialog: {
            isOpen: false,
            oldCity: undefined,
            newCity: undefined,
            distance: undefined,
          },
        });
      },

      handleLocationChange: async (keepOldCity, oldCityId, newCity) => {
        try {
          if (keepOldCity) {
            // Keep the old city in the cities list
            // The old city should already be in the list, so we just add the new one
            get().addOrReplaceCurrentLocation(newCity);
          } else {
            // Remove the old city and add the new one
            get().removeCity(oldCityId);
            get().addOrReplaceCurrentLocation(newCity);
          }

          // Update current location data
          get().updateCurrentLocation(newCity.lat, newCity.lon, newCity.id);

          // Show success toast
          get().showToast({
            message: 'location.locationUpdated',
            type: 'success',
            values: { city: newCity.name[get().locale] },
          });
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error handling location change:', error);
          get().showToast({
            message: 'location.locationCheckFailed',
            type: 'error',
          });
        }
      },

      sendLocationChangeNotification: async (oldCityName: string, newCityName: string, locale: string) => {
        try {
          await locationService.sendLocationChangeNotification({
            oldCityName,
            newCityName,
            locale: locale as 'he' | 'en',
          });
        } catch {
          // console.error('Error sending location change notification:', error);
        }
      },
    })
);