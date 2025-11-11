'use client';

import { useCallback } from 'react';

import { weatherActions } from '@/features/weather/actions/weatherActions';
import { useWeatherDataStore } from '@/features/weather/store/useWeatherDataStore';
import { useQuickAddStore } from '@/features/search/store/useQuickAddStore';

export const useWeatherActions = () => {
  const addCity = useCallback(weatherActions.addCity, []);
  const addOrReplaceCurrentLocation = useCallback(weatherActions.addOrReplaceCurrentLocation, []);
  const removeCity = useCallback(weatherActions.removeCity, []);
  const refreshCity = useCallback(weatherActions.refreshCity, []);
  const applyBackgroundUpdate = useCallback(weatherActions.applyBackgroundUpdate, []);
  const handleLocationChange = useCallback(weatherActions.handleLocationChange, []);
  const closeQuickAddAndResetLoading = useCallback(weatherActions.closeQuickAddAndResetLoading, []);
  const persistPreferencesIfAuthenticated = useCallback(weatherActions.persistPreferencesIfAuthenticated, []);
  const setCurrentIndex = useCallback(weatherActions.setCurrentIndex, []);
  const setCurrentCity = useCallback(weatherActions.setCurrentCity, []);
  const nextCity = useCallback(weatherActions.nextCity, []);
  const prevCity = useCallback(weatherActions.prevCity, []);
  const setIsLoading = useCallback((value: boolean) => useWeatherDataStore.setState({ isLoading: value }), []);
  const setAutoLocationCityId = useCallback(weatherActions.setAutoLocationCityId, []);
  const setQuickAddOpen = useCallback((open: boolean) => useQuickAddStore.setState({ isOpen: open }), []);

  return {
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
    setIsLoading,
    setAutoLocationCityId,
    setQuickAddOpen,
  };
};
