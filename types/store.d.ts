import { CityWeather } from './weather';
import { AppLocale } from './i18n';
import { TemporaryUnit as TemporaryUnit, ThemeMode, Direction, ToastMessage } from './ui';

export interface WeatherStore {
  cities: CityWeather[]; 
  currentIndex: number; 
  unit: TemporaryUnit; 
  locale: AppLocale; 
  theme: ThemeMode; 
  direction: Direction; 
  toasts: ToastMessage[];
  isLoading: boolean;
  autoLocationCityId?: string;
  userTimezoneOffset: number;
}

export interface WeatherStoreActions {
  addCity: (_city: CityWeather) => void;
  addOrReplaceCurrentLocation: (_city: CityWeather) => void;
  updateCity: (_city: CityWeather) => void;
  removeCity: (_id: string) => void;
  refreshCity: (_id: string) => void;
  setUnit: (_unit: TemporaryUnit) => void;
  setLocale: (_locale: AppLocale) => void;
  setTheme: (_theme: ThemeMode) => void;
  nextCity: () => void;
  prevCity: () => void;
  showToast: (options: { message: string; values?: Record<string, any> }) => void;
  hideToast: (_id: number) => void;
  setIsLoading: (_isLoading: boolean) => void;
  clearAllToastTimeouts: () => void;
  setUserTimezoneOffset: (_offset: number) => void; 
  getUserTimezoneOffset: () => number; 
  resetStore: () => void;
}
