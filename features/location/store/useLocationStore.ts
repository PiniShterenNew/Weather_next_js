'use client';

import { create } from 'zustand';

import type { CityWeather } from '@/types/weather';

interface LocationChangeDialogState {
  isOpen: boolean;
  oldCity?: CityWeather;
  newCity?: CityWeather;
  distance?: number;
}

interface LocationTrackingState {
  currentLocationData?: {
    lat: number;
    lon: number;
    cityId: string;
    lastChecked: number;
  };
  locationTrackingEnabled: boolean;
  locationChangeDialog: LocationChangeDialogState;
}

interface LocationTrackingActions {
  updateCurrentLocation: (lat: number, lon: number, cityId: string) => void;
  setLocationTrackingEnabled: (enabled: boolean) => void;
  showLocationChangeDialog: (payload: { oldCity?: CityWeather; newCity?: CityWeather; distance?: number }) => void;
  hideLocationChangeDialog: () => void;
  resetLocationState: () => void;
}

export type LocationTrackingStore = LocationTrackingState & LocationTrackingActions;

const initialDialogState: LocationChangeDialogState = {
  isOpen: false,
  oldCity: undefined,
  newCity: undefined,
  distance: undefined,
};

export const useLocationStore = create<LocationTrackingStore>((set) => ({
  currentLocationData: undefined,
  locationTrackingEnabled: false,
  locationChangeDialog: initialDialogState,
  updateCurrentLocation: (lat, lon, cityId) =>
    set({
      currentLocationData: {
        lat,
        lon,
        cityId,
        lastChecked: Date.now(),
      },
    }),
  setLocationTrackingEnabled: (enabled) => set({ locationTrackingEnabled: enabled }),
  showLocationChangeDialog: ({ oldCity, newCity, distance }) =>
    set({
      locationChangeDialog: {
        isOpen: true,
        oldCity,
        newCity,
        distance,
      },
    }),
  hideLocationChangeDialog: () =>
    set({
      locationChangeDialog: initialDialogState,
    }),
  resetLocationState: () =>
    set({
      currentLocationData: undefined,
      locationTrackingEnabled: false,
      locationChangeDialog: initialDialogState,
    }),
}));


