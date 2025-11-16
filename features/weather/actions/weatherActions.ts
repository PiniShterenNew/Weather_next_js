'use client';

import type { CityWeather } from '@/types/weather';
import type { TemporaryUnit } from '@/types/ui';

import { fetchWeather } from '@/features/weather';
import { weatherPersistenceService } from '@/features/weather/services/weatherPersistenceService';
import { useWeatherDataStore } from '@/features/weather/store/useWeatherDataStore';
import { useAppPreferencesStore } from '@/store/useAppPreferencesStore';
import { useToastStore } from '@/features/ui/store/useToastStore';
import { useQuickAddStore } from '@/features/search/store/useQuickAddStore';
import { useLocationStore } from '@/features/location/store/useLocationStore';
import announceAction from '@/lib/actions/announceAction';

interface AddCityOptions {
  persist?: boolean;
}

const setLoading = (value: boolean) => {
  useWeatherDataStore.setState({ isLoading: value });
};

const persistPreferencesIfAuthenticated = async (cities: CityWeather[]) => {
  const preferences = useAppPreferencesStore.getState();
  if (!preferences.isAuthenticated) {
    return;
  }

  const payload = {
    locale: preferences.locale,
    theme: preferences.theme,
    unit: preferences.unit,
    cities: cities.map(weatherPersistenceService.normalizeCityForPersistence),
  };

  await weatherPersistenceService.persistUserPreferences(payload);
};

const addCity = async (city: CityWeather, options: AddCityOptions = {}) => {
  const { persist = true } = options;
  const dataStore = useWeatherDataStore.getState();
  const preferences = useAppPreferencesStore.getState();

  if (dataStore.cities.length >= dataStore.maxCities) {
    await announceAction({ run: async () => {}, successMessageKey: 'toasts.maxCities', values: { maxCities: dataStore.maxCities.toString() } });
    return false;
  }

  const alreadyExists = dataStore.cities.some((existing) => existing.id === city.id);
  if (alreadyExists) {
    await announceAction({ run: async () => {}, successMessageKey: 'toasts.exists', values: { city: city.name[preferences.locale] } });
    return false;
  }

  setLoading(true);

  try {
    const nextCities = [...dataStore.cities.filter((existing) => existing.id !== city.id), city];
    if (persist) {
      await persistPreferencesIfAuthenticated(nextCities);
    }
    dataStore.addCity(city);
    return true;
  } catch {
    await announceAction({ run: async () => {}, errorMessageKey: 'toasts.error' });
    return false;
  } finally {
    setLoading(false);
  }
};

const addOrReplaceCurrentLocation = async (city: CityWeather) => {
  const dataStore = useWeatherDataStore.getState();

  // Check if this city is already the current location
  if (city.id === dataStore.autoLocationCityId) {
    // City is already the current location, no need to update
    return;
  }

  // Add city to store first (optimistic update)
  dataStore.addOrReplaceCurrentLocation(city);

  try {
    // Get updated cities after adding (which already has the new city as first)
    const updatedCities = useWeatherDataStore.getState().cities;

    // Build payload for persistence (cities are already in correct order)
    const updated = updatedCities.map((c) => ({
      ...c,
      isCurrentLocation: c.id === city.id,
    }));

    // Try to persist to server (non-blocking - city is already in store)
    await persistPreferencesIfAuthenticated(updated);
  } catch (error) {
    // Silently fail - city is already in store, persistence is optional
    // eslint-disable-next-line no-console
    console.error('Failed to persist current location to server:', error);
  }
};

const removeCity = async (id: string) => {
  const dataStore = useWeatherDataStore.getState();
  const { showToast } = useToastStore.getState();

  const target = dataStore.cities.find((city) => city.id === id);
  if (!target) {
    return;
  }

  setLoading(true);

  try {
    const nextCities = dataStore.cities.filter((city) => city.id !== id);
    await persistPreferencesIfAuthenticated(nextCities);
    dataStore.removeCity(id);
  } catch {
    showToast({ message: 'toasts.error', type: 'error' });
  } finally {
    setLoading(false);
  }
};

const refreshCity = async (id: string, options: { background?: boolean } = {}) => {
  const { background = false } = options;

  const dataStore = useWeatherDataStore.getState();
  const preferences = useAppPreferencesStore.getState();

  const city = dataStore.cities.find((entry) => entry.id === id);
  if (!city) {
    return;
  }

  if (!background) {
    setLoading(true);
  }

  try {
    const freshData = await fetchWeather({
      id: city.id,
      lat: city.lat,
      lon: city.lon,
      unit: (city.unit || preferences.unit) as TemporaryUnit,
    });

    const updatedCity: CityWeather = {
      ...freshData,
      lastUpdated: Date.now(),
    };

    dataStore.updateCity(updatedCity);

    if (!background) {
      await announceAction({
        run: async () => {},
        successMessageKey: 'toasts.refreshed',
        values: { city: updatedCity.name[preferences.locale] },
      });
    }
  } catch {
    if (!background) {
      await announceAction({ run: async () => {}, errorMessageKey: 'toasts.error' });
    }
  } finally {
    if (!background) {
      setLoading(false);
    }
  }
};

const applyBackgroundUpdate = (id: string, data: Partial<CityWeather> & { lastUpdatedUtc?: string }) => {
  useWeatherDataStore.getState().applyBackgroundUpdate(id, data);
};

const handleLocationChange = async (keepOldCity: boolean, oldCityId: string, newCity: CityWeather) => {
  if (keepOldCity) {
    await addOrReplaceCurrentLocation(newCity);
  } else {
    await removeCity(oldCityId);
    await addOrReplaceCurrentLocation(newCity);
  }

  const preferences = useAppPreferencesStore.getState();
  const { updateCurrentLocation, hideLocationChangeDialog } = useLocationStore.getState();
  const { showToast } = useToastStore.getState();

  updateCurrentLocation(newCity.lat, newCity.lon, newCity.id);
  hideLocationChangeDialog();
  showToast({
    message: 'location.locationUpdated',
    type: 'success',
    values: { city: newCity.name[preferences.locale] },
  });
};

const closeQuickAddAndResetLoading = () => {
  useQuickAddStore.setState({ isOpen: false });
  setLoading(false);
};

const setCurrentIndex = (index: number) => {
  useWeatherDataStore.getState().setCurrentIndex(index);
};

const setCurrentCity = (id: string) => {
  useWeatherDataStore.getState().setCurrentCity(id);
};

const nextCity = () => {
  useWeatherDataStore.getState().nextCity();
};

const prevCity = () => {
  useWeatherDataStore.getState().prevCity();
};

const setAutoLocationCityId = (id?: string) => {
  useWeatherDataStore.setState({ autoLocationCityId: id });
};

const resetStores = () => {
  useWeatherDataStore.getState().resetWeatherState();
  useAppPreferencesStore.getState().resetPreferences();
  useQuickAddStore.setState({ isOpen: false });
  useToastStore.getState().clearToasts();
  useLocationStore.getState().resetLocationState();
};

export const weatherActions = {
  addCity,
  addOrReplaceCurrentLocation,
  removeCity,
  refreshCity,
  applyBackgroundUpdate,
  handleLocationChange,
  closeQuickAddAndResetLoading,
  persistPreferencesIfAuthenticated,
  setCurrentIndex,
  setCurrentCity,
  nextCity,
  prevCity,
  setAutoLocationCityId,
  resetStores,
};


