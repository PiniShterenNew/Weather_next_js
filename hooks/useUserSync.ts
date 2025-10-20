'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useWeatherStore } from '@/store/useWeatherStore';
import { syncUserToDatabase } from '@/features/auth';
import type { WeatherStore } from '@/types/store';
import type { AppLocale } from '@/types/i18n';
import type { ThemeMode, TemporaryUnit } from '@/types/ui';
import type { CityWeather } from '@/types/weather';

// Debounce delay for syncing preferences (in milliseconds)
const SYNC_DEBOUNCE_DELAY = 2000; // 2 seconds

/**
 * useUserSync Hook
 * Automatically syncs user preferences to the server when they change
 * Only syncs for authenticated users
 */
export function useUserSync() {
  const { user, isLoaded, isSignedIn } = useUser();
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitializedRef = useRef(false);
  const isInitializingRef = useRef(false);
  const isFirstRenderRef = useRef(true);
  
  const locale = useWeatherStore((s) => s.locale);
  const theme = useWeatherStore((s) => s.theme);
  const unit = useWeatherStore((s) => s.unit);
  const cities = useWeatherStore((s) => s.cities);
  const setIsAuthenticated = useWeatherStore((s) => s.setIsAuthenticated);
  const syncWithServer = useWeatherStore((s) => s.syncWithServer);

  // Sync user to database when they sign in
  useEffect(() => {
    const initializeUser = async () => {
      if (isLoaded && isSignedIn && user) {
        // Update auth state first
        setIsAuthenticated(true);
        
        // Only sync on first initialization to avoid duplicate calls on page refresh
        if (!hasInitializedRef.current && !isInitializingRef.current) {
          isInitializingRef.current = true;
          // Sync user to database and get preferences/cities in one API call
          const syncResult = await syncUserToDatabase({
            id: user.id,
            emailAddresses: user.emailAddresses.map((e) => ({ emailAddress: e.emailAddress })),
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: user.imageUrl,
          });
          
          // Apply preferences and cities from sync result
          if (syncResult) {
            const { preferences, cities: serverCities } = syncResult;
            
            // Prepare updates object similar to loadUserPreferences
            const updates: Partial<WeatherStore> = {};
            
            // Update preferences if they exist and are different from current state
            if (preferences.locale !== undefined && preferences.locale !== locale) {
              // Type assertion since we know locale should be AppLocale
              const typedLocale = preferences.locale as AppLocale;
              if (typedLocale === 'he' || typedLocale === 'en') {
                updates.locale = typedLocale;
              }
            }
            if (preferences.theme !== undefined && preferences.theme !== theme) {
              // Type assertion since we know theme should be ThemeMode
              const typedTheme = preferences.theme as ThemeMode;
              if (typedTheme === 'light' || typedTheme === 'dark' || typedTheme === 'system') {
                updates.theme = typedTheme;
              }
            }
            if (preferences.unit !== undefined && preferences.unit !== unit) {
              // Type assertion since we know unit should be TemporaryUnit
              const typedUnit = preferences.unit as TemporaryUnit;
              if (typedUnit === 'metric' || typedUnit === 'imperial') {
                updates.unit = typedUnit;
              }
            }
            
            // Update cities if they exist
            if (Array.isArray(serverCities)) {
              // Type assertion since we know cities should be CityWeather[]
              updates.cities = serverCities as CityWeather[];
            }
            
            // Apply all updates at once
            if (Object.keys(updates).length > 0) {
              useWeatherStore.setState(updates);
            }
          }
          
          // Mark as initialized to prevent duplicate sync calls
          hasInitializedRef.current = true;
          isInitializingRef.current = false;
        }
      } else if (isLoaded && !isSignedIn) {
        setIsAuthenticated(false);
        // Reset initialization flag when user signs out
        hasInitializedRef.current = false;
        isInitializingRef.current = false;
      }
    };

    initializeUser();
  }, [isLoaded, isSignedIn, user, setIsAuthenticated]);

  // Debounced sync on preference changes
  useEffect(() => {
    // Skip sync on first render (page load/refresh) to prevent unnecessary API calls
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    
    // useUserSync: preference change detected
    
    // Only sync if authenticated and already initialized (prevents sync on page refresh)
    if (!isSignedIn || !isLoaded || !hasInitializedRef.current || isInitializingRef.current) {
      // useUserSync: not authenticated or not yet initialized or currently initializing, skipping sync
      return;
    }

    // useUserSync: scheduling sync

    // Clear existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Schedule new sync (background sync, no UI loading)
    syncTimeoutRef.current = setTimeout(() => {
      // useUserSync: executing syncWithServer
      syncWithServer();
    }, SYNC_DEBOUNCE_DELAY);

    // Cleanup
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [locale, theme, unit, cities, isSignedIn, isLoaded, syncWithServer]);
}

