'use client';

import { useMemo } from 'react';

import type { WeatherStore, WeatherStoreActions } from '@/types/store';
import type { AppLocale } from '@/types/i18n';
import type { TemporaryUnit, ThemeMode, Direction } from '@/types/ui';
import type {
  CityWeather,
  WeatherCurrent,
  WeatherForecastItem,
  WeatherHourlyItem,
} from '@/types/weather';

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

interface ServerCityPayload {
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
}

interface ServerBootstrapPayload {
  cities: ServerCityPayload[];
  currentCityId?: string;
  user: { locale: string; unit: string };
}

const loadFromServerImpl = (payload: ServerBootstrapPayload) => {
  useWeatherDataStore
    .getState()
    .loadFromServer({
      cities: payload.cities,
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

  // Guard against undefined/null values
  const safeCities = dataStore?.cities || [];
  const safeCurrentIndex = dataStore?.currentIndex ?? 0;

  return {
    cities: safeCities,
    currentIndex: safeCurrentIndex,
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
    locationChangeDialog: locationStore.locationChangeDialog ?? { isOpen: false },

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

  // Guard against undefined preferences or locationState
  if (!preferences || typeof preferences !== 'object') {
    console.error('useAppPreferencesStore returned invalid value', { preferences });
    const minimalState = {
      cities: [],
      currentIndex: 0,
      isLoading: false,
      unit: 'metric' as const,
      locale: 'he' as const,
      theme: 'system' as const,
      direction: 'rtl' as const,
      toasts: [],
      open: false,
      maxCities: 15,
      isAuthenticated: false,
      isSyncing: false,
      userTimezoneOffset: 0,
      autoLocationCityId: undefined,
      currentLocationData: undefined,
      locationTrackingEnabled: false,
      locationChangeDialog: { isOpen: false },
    } as unknown as CombinedState;
    
    const select = selector ?? ((state: CombinedState) => state as unknown as T);
    return select(minimalState);
  }

  if (!locationState || typeof locationState !== 'object') {
    console.error('useLocationStore returned invalid value', { locationState });
    const minimalState = {
      cities: [],
      currentIndex: 0,
      isLoading: false,
      unit: 'metric' as const,
      locale: 'he' as const,
      theme: 'system' as const,
      direction: 'rtl' as const,
      toasts: [],
      open: false,
      maxCities: 15,
      isAuthenticated: false,
      isSyncing: false,
      userTimezoneOffset: 0,
      autoLocationCityId: undefined,
      currentLocationData: undefined,
      locationTrackingEnabled: false,
      locationChangeDialog: { isOpen: false },
    } as unknown as CombinedState;
    
    const select = selector ?? ((state: CombinedState) => state as unknown as T);
    return select(minimalState);
  }

  // Guard against undefined actions
  if (!actions || typeof actions !== 'object') {
    console.error('useWeatherActions returned invalid value', { actions });
    // Return minimal state to prevent crashes
    const minimalState = {
      cities: [],
      currentIndex: 0,
      isLoading: false,
      unit: 'metric' as const,
      locale: 'he' as const,
      theme: 'system' as const,
      direction: 'rtl' as const,
      toasts: [],
      open: false,
      maxCities: 15,
      isAuthenticated: false,
      isSyncing: false,
      userTimezoneOffset: 0,
      autoLocationCityId: undefined,
      currentLocationData: undefined,
      locationTrackingEnabled: false,
      locationChangeDialog: { isOpen: false },
    } as unknown as CombinedState;
    
    const select = selector ?? ((state: CombinedState) => state as unknown as T);
    return select(minimalState);
  }

  // Ensure all dependencies are valid objects/values before useMemo to prevent Object.keys errors
  const safeActions: Partial<WeatherStoreActions> =
    actions && typeof actions === 'object' ? (actions as Partial<WeatherStoreActions>) : {};
  const safePreferences = preferences && typeof preferences === 'object' ? preferences : {
    unit: 'metric',
    locale: 'he',
    theme: 'system',
    direction: 'rtl',
    userTimezoneOffset: 0,
    isAuthenticated: false,
    isSyncing: false,
  };
  const safeLocationState = locationState && typeof locationState === 'object' ? locationState : {
    currentLocationData: undefined,
    locationTrackingEnabled: false,
    locationChangeDialog: { isOpen: false },
  };

  const combined = useMemo<CombinedState>(() => {
    const baseState = buildState();
    // Guard against undefined/null baseState
    if (!baseState || typeof baseState !== 'object') {
      return buildState(); // Fallback to rebuild
    }
    
    return {
      ...baseState,
      cities: cities || [],
      currentIndex: currentIndex ?? 0,
      isLoading: isLoading ?? false,
      autoLocationCityId,
      maxCities: maxCities ?? 15,
      unit: (safePreferences.unit || 'metric') as TemporaryUnit,
      locale: (safePreferences.locale || 'he') as AppLocale,
      theme: (safePreferences.theme || 'system') as ThemeMode,
      direction: (safePreferences.direction || 'rtl') as Direction,
      userTimezoneOffset: safePreferences.userTimezoneOffset || 0,
      isAuthenticated: safePreferences.isAuthenticated ?? false,
      isSyncing: safePreferences.isSyncing ?? false,
      toasts: toasts || [],
      open: quickAddOpen ?? false,
      currentLocationData: safeLocationState.currentLocationData,
      locationTrackingEnabled: safeLocationState.locationTrackingEnabled ?? false,
      locationChangeDialog: safeLocationState.locationChangeDialog ?? { isOpen: false },
      setOpen: safeActions.setOpen || (() => {}),
      addCity: safeActions.addCity || (async (_city: CityWeather) => false),
      addOrReplaceCurrentLocation:
        safeActions.addOrReplaceCurrentLocation || (async (_city: CityWeather) => {}),
      removeCity: safeActions.removeCity || (async (_id: string) => {}),
      setCurrentIndex: safeActions.setCurrentIndex || (() => {}),
      showToast: useToastStore.getState().showToast || (() => {}),
      hideToast: useToastStore.getState().hideToast || (() => {}),
      setIsLoading: safeActions.setIsLoading || (() => {}),
      nextCity: safeActions.nextCity || (() => {}),
      prevCity: safeActions.prevCity || (() => {}),
      handleLocationChange:
        safeActions.handleLocationChange ||
        ((_keepOldCity: boolean, _oldCityId: string, _newCity: CityWeather) => {}),
      refreshCity:
        safeActions.refreshCity || (async (_id: string, _opts?: { background?: boolean }) => {}),
      applyBackgroundUpdate:
        safeActions.applyBackgroundUpdate ||
        ((_id: string, _data: { lastUpdatedUtc: string } & Partial<CityWeather>) => {}),
      closeQuickAddAndResetLoading: safeActions.closeQuickAddAndResetLoading || (() => {}),
      persistPreferencesIfAuthenticated:
        safeActions.persistPreferencesIfAuthenticated || (async (_cities: CityWeather[]) => {}),
      setAutoLocationCityId: safeActions.setAutoLocationCityId || ((_id?: string) => {}),
    };
  }, [
      safeActions,
      autoLocationCityId,
      cities,
      currentIndex,
      isLoading,
      safeLocationState.currentLocationData,
      safeLocationState.locationChangeDialog,
      safeLocationState.locationTrackingEnabled,
      maxCities,
      safePreferences.direction,
      safePreferences.isAuthenticated,
      safePreferences.isSyncing,
      safePreferences.locale,
      safePreferences.theme,
      safePreferences.unit,
      safePreferences.userTimezoneOffset,
      quickAddOpen,
      toasts,
    ],
  );

  // Guard against undefined/null combined state
  if (!combined || typeof combined !== 'object') {
    // Return a safe fallback state
    const fallbackState = buildState();
    if (!fallbackState || typeof fallbackState !== 'object') {
      // Last resort: return empty object with minimal required properties
      const minimalState = {
        cities: [],
        currentIndex: 0,
        isLoading: false,
        unit: 'metric' as const,
        locale: 'he' as const,
        theme: 'system' as const,
        direction: 'rtl' as const,
        toasts: [],
        open: false,
        maxCities: 15,
        isAuthenticated: false,
        isSyncing: false,
        userTimezoneOffset: 0,
        autoLocationCityId: undefined,
        currentLocationData: undefined,
        locationTrackingEnabled: false,
        locationChangeDialog: { isOpen: false },
      } as unknown as CombinedState;
      const select = selector ?? ((state: CombinedState) => state as unknown as T);
      return select(minimalState);
    }
    const select = selector ?? ((state: CombinedState) => state as unknown as T);
    return select(fallbackState);
  }

  try {
    const select = selector ?? ((state: CombinedState) => state as unknown as T);
    const result = select(combined);
    
    // Guard against undefined/null result - React DevTools might call Object.keys on this
    if (result === undefined || result === null) {
      // If selector returns undefined/null, return the property directly
      if (selector) {
        // Try to get the property name from selector if possible
        const fallbackState = buildState();
        const fallbackResult = select(fallbackState);
        // Ensure we always return an object, not undefined/null
        if (fallbackResult === undefined || fallbackResult === null) {
          // Last resort: return empty object
          return {} as T;
        }
        return fallbackResult;
      }
      // If no selector, return the combined state (which we already validated is an object)
      return combined as unknown as T;
    }
    
    // Return result as-is (can be primitive or object)
    return result;
  } catch (error) {
    // If selector throws, return fallback
    console.error('useWeatherStore selector error:', error);
    try {
      const fallbackState = buildState();
      if (!fallbackState || typeof fallbackState !== 'object') {
        return {} as T;
      }
      const select = selector ?? ((state: CombinedState) => state as unknown as T);
      const fallbackResult = select(fallbackState);
      if (fallbackResult === undefined || fallbackResult === null) {
        return {} as T;
      }
      return fallbackResult;
    } catch (fallbackError) {
      console.error('useWeatherStore fallback error:', fallbackError);
      return {} as T;
    }
  }
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

