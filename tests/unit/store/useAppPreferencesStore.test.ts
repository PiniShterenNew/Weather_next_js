import { describe, beforeEach, it, expect } from 'vitest';

import { useAppPreferencesStore } from '@/store/useAppPreferencesStore';

const initialTimezoneOffset = -new Date().getTimezoneOffset() * 60;

const resetStore = () => {
  useAppPreferencesStore.setState({
    unit: 'metric',
    locale: 'he',
    theme: 'system',
    direction: 'rtl',
    userTimezoneOffset: initialTimezoneOffset,
    isAuthenticated: false,
    isSyncing: false,
  });
};

describe('useAppPreferencesStore', () => {
  beforeEach(() => {
    resetStore();
  });

  it('exposes the initial state', () => {
    const state = useAppPreferencesStore.getState();

    expect(state.unit).toBe('metric');
    expect(state.locale).toBe('he');
    expect(state.theme).toBe('system');
    expect(state.direction).toBe('rtl');
    expect(state.userTimezoneOffset).toBe(initialTimezoneOffset);
    expect(state.isAuthenticated).toBe(false);
    expect(state.isSyncing).toBe(false);
  });

  it('updates individual preferences', () => {
    const { setUnit, setLocale, setTheme, setDirection, setIsAuthenticated, setIsSyncing } =
      useAppPreferencesStore.getState();

    setUnit('imperial');
    setLocale('en');
    expect(useAppPreferencesStore.getState().direction).toBe('ltr');
    setTheme('dark');
    setDirection('rtl');
    setIsAuthenticated(true);
    setIsSyncing(true);

    const updated = useAppPreferencesStore.getState();
    expect(updated.unit).toBe('imperial');
    expect(updated.locale).toBe('en');
    expect(updated.theme).toBe('dark');
    expect(updated.direction).toBe('rtl');
    expect(updated.isAuthenticated).toBe(true);
    expect(updated.isSyncing).toBe(true);
  });

  it('updates timezone offset and exposes getter', () => {
    const offsetSeconds = 7200;
    const { setUserTimezoneOffset, getUserTimezoneOffset } = useAppPreferencesStore.getState();

    setUserTimezoneOffset(offsetSeconds);
    expect(useAppPreferencesStore.getState().userTimezoneOffset).toBe(offsetSeconds);
    expect(getUserTimezoneOffset()).toBe(offsetSeconds);
  });

  it('resets preferences to defaults', () => {
    const { setUnit, setLocale, setTheme, setDirection, setIsAuthenticated, setIsSyncing, resetPreferences } =
      useAppPreferencesStore.getState();

    setUnit('imperial');
    setLocale('en');
    setTheme('light');
    setDirection('rtl');
    setIsAuthenticated(true);
    setIsSyncing(true);

    resetPreferences();

    const state = useAppPreferencesStore.getState();
    expect(state.unit).toBe('metric');
    expect(state.locale).toBe('he');
    expect(state.theme).toBe('system');
    expect(state.direction).toBe('rtl');
    expect(state.userTimezoneOffset).toBe(initialTimezoneOffset);
    expect(state.isAuthenticated).toBe(false);
    expect(state.isSyncing).toBe(false);
  });
});


