/**
 * Settings Feature Types
 * Type definitions for settings-related functionality
 */

import { AppLocale } from '@/types/i18n';

// Settings Data Types
export interface SettingsData {
  language: AppLocale;
  temperatureUnit: 'celsius' | 'fahrenheit';
  theme: 'light' | 'dark' | 'system';
  autoRefresh: boolean;
  refreshInterval: number; // in minutes
  notifications: boolean;
}

// Settings Component Props
export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export interface LanguageSwitcherProps {
  currentLanguage: AppLocale;
  onLanguageChange: (language: AppLocale) => void;
  className?: string;
}

export interface TemperatureUnitToggleProps {
  currentUnit: 'celsius' | 'fahrenheit';
  onUnitChange: (unit: 'celsius' | 'fahrenheit') => void;
  className?: string;
}

export interface ThemeSwitcherProps {
  currentTheme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  className?: string;
}

// Settings API Types
export interface SettingsUpdateInput {
  language?: AppLocale;
  temperatureUnit?: 'celsius' | 'fahrenheit';
  theme?: 'light' | 'dark' | 'system';
  autoRefresh?: boolean;
  refreshInterval?: number;
  notifications?: boolean;
}

export interface SettingsResponse {
  success: boolean;
  data?: SettingsData;
  error?: string;
}

// Settings Store Types
export interface SettingsStoreState {
  settings: SettingsData;
  isLoading: boolean;
  error: string | null;
}

export interface SettingsStoreActions {
  updateSettings: (settings: Partial<SettingsData>) => void;
  resetSettings: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export type SettingsStore = SettingsStoreState & SettingsStoreActions;
