/**
 * Settings Feature Exports
 * Central export point for settings feature
 */

// Components
export { default as SettingsModal } from './components/SettingsModal';
export { default as LanguageSwitcher } from './components/LanguageSwitcher';
export { default as TemperatureUnitToggle } from './components/TemperatureUnitToggle';
export { default as ThemeSwitcher } from './components/ThemeSwitcher';

// Pages
export { default as SettingsPage } from './pages/SettingsPage';

// Types
export type {
  SettingsData,
  SettingsModalProps,
  LanguageSwitcherProps,
  TemperatureUnitToggleProps,
  ThemeSwitcherProps,
  SettingsUpdateInput,
  SettingsResponse,
  SettingsStoreState,
  SettingsStoreActions,
  SettingsStore,
} from './types';
