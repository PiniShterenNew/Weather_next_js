'use client';

import { useMemo } from 'react';

import type { WeatherStore, WeatherStoreActions } from '@/types/store';
import type { AppLocale } from '@/types/i18n';
import type { TemporaryUnit } from '@/types/ui';
import type { CityWeather } from '@/types/weather';

import { locationService } from '@/features/location/services/locationService';
import { useWeatherDataStore } from '@/features/weather/store/useWeatherDataStore';
import { useAppPreferencesStore } from '@/store/useAppPreferencesStore';
import { useToastStore } from '@/features/ui/store/useToastStore';
import { useQuickAddStore } from '@/features/search/store/useQuickAddStore';
import { useLocationStore } from '@/features/location/store/useLocationStore';
import { weatherActions } from '@/features/weather/actions/weatherActions';
import { useWeatherActions } from '@/features/weather/hooks/useWeatherActions';

type CombinedState = WeatherStore & WeatherStoreActions;

const sendLocationChangeNotification = async (oldCityName: string, newCityName: string, locale: string) => {
  try {
    await locationService.sendLocationChangeNotification({
      oldCityName,
      newCityName,
      locale: locale as 'he' | 'en',
    });
  } catch {
    // ignore
  }
};

const loadFromServerImpl = (payload: { cities: unknown[]; currentCityId?: string; user: { locale: string; unit: string } }) => {
  useWeatherDataStore
    .getState()
    .loadFromServer({
      cities: payload.cities as Array<{
        id: string;
        lat: number;
        lon: number;
        name: { en: string; he: string };
        country: { en: string; he: string };
        isCurrentLocation?: boolean;
        lastUpdatedUtc: string;
        current: unknown;
        forecast: unknown;
        hourly: unknown;
      }>,
      currentCityId: payload.currentCityId,
    });

  const preferences = useAppPreferencesStore.getState();
  preferences.setLocale(payload.user.locale as AppLocale);
  preferences.setUnit(payload.user.unit as TemporaryUnit);
  preferences.setIsAuthenticated(true);
};

const buildState = (): CombinedState => {
  const dataStore = useWeatherDataStore.getState();
  const preferences = useAppPreferencesStore.getState();
  const toastStore = useToastStore.getState();
  const quickAddStore = useQuickAddStore.getState();
  const locationStore = useLocationStore.getState();

  return {
    cities: dataStore.cities,
    currentIndex: dataStore.currentIndex,
    unit: preferences.unit,
    locale: preferences.locale,
    theme: preferences.theme,
    direction: preferences.direction,
    toasts: toastStore.toasts,
    isLoading: dataStore.isLoading,
    autoLocationCityId: dataStore.autoLocationCityId,
    userTimezoneOffset: preferences.userTimezoneOffset,
    open: quickAddStore.isOpen,
    maxCities: dataStore.maxCities,
    currentLocationData: locationStore.currentLocationData,
    locationTrackingEnabled: locationStore.locationTrackingEnabled,
    locationChangeDialog: locationStore.locationChangeDialog,

    setOpen: (open: boolean) => useQuickAddStore.setState({ isOpen: open }),
    addCity: weatherActions.addCity,
    addOrReplaceCurrentLocation: weatherActions.addOrReplaceCurrentLocation,
    updateCity: dataStore.updateCity,
    removeCity: weatherActions.removeCity,
    setUnit: preferences.setUnit,
    setLocale: preferences.setLocale,
    setTheme: preferences.setTheme,
    setCurrentIndex: weatherActions.setCurrentIndex,
    showToast: toastStore.showToast,
    hideToast: toastStore.hideToast,
    setIsLoading: (value: boolean) => useWeatherDataStore.setState({ isLoading: value }),
    nextCity: weatherActions.nextCity,
    prevCity: weatherActions.prevCity,
    setUserTimezoneOffset: preferences.setUserTimezoneOffset,
    getUserTimezoneOffset: () => useAppPreferencesStore.getState().userTimezoneOffset,
    resetStore: weatherActions.resetStores,
    isAuthenticated: preferences.isAuthenticated,
    isSyncing: preferences.isSyncing,
    setIsAuthenticated: preferences.setIsAuthenticated,
    setIsSyncing: preferences.setIsSyncing,
    updateCurrentLocation: locationStore.updateCurrentLocation,
    setLocationTrackingEnabled: locationStore.setLocationTrackingEnabled,
    showLocationChangeDialog: (oldCity?: CityWeather, newCity?: CityWeather, distance?: number) =>
      locationStore.showLocationChangeDialog({ oldCity, newCity, distance }),
    hideLocationChangeDialog: locationStore.hideLocationChangeDialog,
    handleLocationChange: weatherActions.handleLocationChange,
    sendLocationChangeNotification,
    loadFromServer: loadFromServerImpl,
    bootstrapLoad: loadFromServerImpl,
    refreshCity: weatherActions.refreshCity,
    setCurrentCity: weatherActions.setCurrentCity,
    applyBackgroundUpdate: weatherActions.applyBackgroundUpdate,
    closeQuickAddAndResetLoading: weatherActions.closeQuickAddAndResetLoading,
    persistPreferencesIfAuthenticated: weatherActions.persistPreferencesIfAuthenticated,
    setAutoLocationCityId: weatherActions.setAutoLocationCityId,
  };
};

export const useWeatherStore = <T = CombinedState>(selector?: (state: CombinedState) => T): T => {
  const cities = useWeatherDataStore((state) => state.cities);
  const currentIndex = useWeatherDataStore((state) => state.currentIndex);
  const isLoading = useWeatherDataStore((state) => state.isLoading);
  const autoLocationCityId = useWeatherDataStore((state) => state.autoLocationCityId);
  const maxCities = useWeatherDataStore((state) => state.maxCities);

  const preferences = useAppPreferencesStore();
  const toasts = useToastStore((state) => state.toasts);
  const quickAddOpen = useQuickAddStore((state) => state.isOpen);
  const locationState = useLocationStore();
  const actions = useWeatherActions();

  const combined = useMemo<CombinedState>(
    () => ({
      ...buildState(),
      cities,
      currentIndex,
      isLoading,
      autoLocationCityId,
      maxCities,
      unit: preferences.unit,
      locale: preferences.locale,
      theme: preferences.theme,
      direction: preferences.direction,
      userTimezoneOffset: preferences.userTimezoneOffset,
      isAuthenticated: preferences.isAuthenticated,
      isSyncing: preferences.isSyncing,
      toasts,
      open: quickAddOpen,
      currentLocationData: locationState.currentLocationData,
      locationTrackingEnabled: locationState.locationTrackingEnabled,
      locationChangeDialog: locationState.locationChangeDialog,
      setOpen: actions.setQuickAddOpen,
      addCity: actions.addCity,
      addOrReplaceCurrentLocation: actions.addOrReplaceCurrentLocation,
      removeCity: actions.removeCity,
      setCurrentIndex: actions.setCurrentIndex,
      showToast: useToastStore.getState().showToast,
      hideToast: useToastStore.getState().hideToast,
      setIsLoading: actions.setIsLoading,
      nextCity: actions.nextCity,
      prevCity: actions.prevCity,
      handleLocationChange: actions.handleLocationChange,
      refreshCity: actions.refreshCity,
      applyBackgroundUpdate: actions.applyBackgroundUpdate,
      closeQuickAddAndResetLoading: actions.closeQuickAddAndResetLoading,
      persistPreferencesIfAuthenticated: actions.persistPreferencesIfAuthenticated,
      setAutoLocationCityId: actions.setAutoLocationCityId,
    }),
    [
      actions,
      autoLocationCityId,
      cities,
      currentIndex,
      isLoading,
      locationState.currentLocationData,
      locationState.locationChangeDialog,
      locationState.locationTrackingEnabled,
      maxCities,
      preferences.direction,
      preferences.isAuthenticated,
      preferences.isSyncing,
      preferences.locale,
      preferences.theme,
      preferences.unit,
      preferences.userTimezoneOffset,
      quickAddOpen,
      toasts,
    ],
  );

  const select = selector ?? ((state: CombinedState) => state as unknown as T);
  return select(combined);
};

useWeatherStore.getState = buildState;

useWeatherStore.setState = (partial: Partial<CombinedState>) => {
  if ('cities' in partial && partial.cities) {
    useWeatherDataStore.setState({ cities: partial.cities });
  }
  if ('currentIndex' in partial && typeof partial.currentIndex === 'number') {
    useWeatherDataStore.setState({ currentIndex: partial.currentIndex });
  }
  if ('isLoading' in partial && typeof partial.isLoading === 'boolean') {
    useWeatherDataStore.setState({ isLoading: partial.isLoading });
  }
  if ('autoLocationCityId' in partial) {
    useWeatherDataStore.setState({ autoLocationCityId: partial.autoLocationCityId });
  }
  if ('unit' in partial && partial.unit) {
    useAppPreferencesStore.setState({ unit: partial.unit });
  }
  if ('locale' in partial && partial.locale) {
    useAppPreferencesStore.setState({ locale: partial.locale as AppLocale });
  }
  if ('theme' in partial && partial.theme) {
    useAppPreferencesStore.setState({ theme: partial.theme });
  }
  if ('direction' in partial && partial.direction) {
    useAppPreferencesStore.setState({ direction: partial.direction });
  }
  if ('userTimezoneOffset' in partial && typeof partial.userTimezoneOffset === 'number') {
    useAppPreferencesStore.setState({ userTimezoneOffset: partial.userTimezoneOffset });
  }
  if ('isAuthenticated' in partial && typeof partial.isAuthenticated === 'boolean') {
    useAppPreferencesStore.setState({ isAuthenticated: partial.isAuthenticated });
  }
  if ('isSyncing' in partial && typeof partial.isSyncing === 'boolean') {
    useAppPreferencesStore.setState({ isSyncing: partial.isSyncing });
  }
  if ('open' in partial && typeof partial.open === 'boolean') {
    useQuickAddStore.setState({ isOpen: partial.open });
  }
  if ('toasts' in partial && Array.isArray(partial.toasts)) {
    useToastStore.setState({ toasts: partial.toasts });
  }
};

