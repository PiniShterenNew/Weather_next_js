import { beforeEach, describe, expect, it } from 'vitest';

import type { CityWeather } from '@/types/weather';
import { useLocationStore } from '@/features/location/store/useLocationStore';

const resetStore = () => {
  useLocationStore.setState({
    currentLocationData: undefined,
    locationTrackingEnabled: false,
    locationChangeDialog: { isOpen: false, oldCity: undefined, newCity: undefined, distance: undefined },
  });
};

describe('useLocationStore', () => {
  const mockCity: CityWeather = {
    id: 'city-1',
    lat: 10,
    lon: 20,
    name: { en: 'Tel Aviv', he: 'תל אביב' },
    country: { en: 'Israel', he: 'ישראל' },
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
      timezone: 'Asia/Jerusalem',
      uvIndex: null,
      rainProbability: null,
    },
    forecast: [],
    hourly: [],
    lastUpdated: Date.now(),
    unit: 'metric',
  };

  beforeEach(() => {
    resetStore();
  });

  it('updates current location data', () => {
    const { updateCurrentLocation } = useLocationStore.getState();
    updateCurrentLocation(12, 34, 'city-abc');

    expect(useLocationStore.getState().currentLocationData).toMatchObject({
      lat: 12,
      lon: 34,
      cityId: 'city-abc',
    });
  });

  it('toggles tracking and dialog visibility', () => {
    const { setLocationTrackingEnabled, showLocationChangeDialog, hideLocationChangeDialog } = useLocationStore.getState();

    setLocationTrackingEnabled(true);
    expect(useLocationStore.getState().locationTrackingEnabled).toBe(true);

    showLocationChangeDialog({ oldCity: mockCity, newCity: mockCity, distance: 5 });
    expect(useLocationStore.getState().locationChangeDialog).toMatchObject({
      isOpen: true,
      oldCity: mockCity,
      newCity: mockCity,
      distance: 5,
    });

    hideLocationChangeDialog();
    expect(useLocationStore.getState().locationChangeDialog.isOpen).toBe(false);
  });

  it('resets the store state', () => {
    const { updateCurrentLocation, setLocationTrackingEnabled, showLocationChangeDialog, resetLocationState } =
      useLocationStore.getState();

    updateCurrentLocation(1, 2, 'city');
    setLocationTrackingEnabled(true);
    showLocationChangeDialog({ oldCity: mockCity });

    resetLocationState();

    const state = useLocationStore.getState();
    expect(state.currentLocationData).toBeUndefined();
    expect(state.locationTrackingEnabled).toBe(false);
    expect(state.locationChangeDialog.isOpen).toBe(false);
  });
});
