'use client';

import { create } from 'zustand';

import type { AppLocale } from '@/types/i18n';
import type { TemporaryUnit } from '@/types/ui';

type ThemeMode = 'system' | 'light' | 'dark';
type TextDirection = 'ltr' | 'rtl';

interface AppPreferencesState {
  unit: TemporaryUnit;
  locale: AppLocale;
  theme: ThemeMode;
  direction: TextDirection;
  userTimezoneOffset: number;
  isAuthenticated: boolean;
  isSyncing: boolean;
}

interface AppPreferencesActions {
  setUnit: (unit: TemporaryUnit) => void;
  setLocale: (locale: AppLocale) => void;
  setTheme: (theme: ThemeMode) => void;
  setDirection: (direction: TextDirection) => void;
  setUserTimezoneOffset: (offsetSeconds: number) => void;
  getUserTimezoneOffset: () => number;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setIsSyncing: (isSyncing: boolean) => void;
  resetPreferences: () => void;
}

type AppPreferencesStore = AppPreferencesState & AppPreferencesActions;

const initialTimezoneOffset = -new Date().getTimezoneOffset() * 60;

export const useAppPreferencesStore = create<AppPreferencesStore>((set, get) => ({
  unit: 'metric',
  locale: 'he',
  theme: 'system',
  direction: 'ltr',
  userTimezoneOffset: initialTimezoneOffset,
  isAuthenticated: false,
  isSyncing: false,
  setUnit: (unit) => set({ unit }),
  setLocale: (locale) => set({ locale }),
  setTheme: (theme) => set({ theme }),
  setDirection: (direction) => set({ direction }),
  setUserTimezoneOffset: (offsetSeconds) => set({ userTimezoneOffset: offsetSeconds }),
  getUserTimezoneOffset: () => get().userTimezoneOffset,
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setIsSyncing: (isSyncing) => set({ isSyncing }),
  resetPreferences: () =>
    set({
      unit: 'metric',
      locale: 'he',
      theme: 'system',
      direction: 'ltr',
      userTimezoneOffset: initialTimezoneOffset,
      isAuthenticated: false,
      isSyncing: false,
    }),
}));

export type { AppPreferencesState, AppPreferencesActions, AppPreferencesStore, ThemeMode, TextDirection };


