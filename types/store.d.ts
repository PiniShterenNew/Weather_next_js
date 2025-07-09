import { CityWeather, CityWeatherCurrent } from './weather';
import { TemporaryUnit as TemporaryUnit, ThemeMode, Direction, ToastMessage } from './ui';
import { AppLocale } from './i18n';

export interface WeatherStore {
  cities: CityWeather[]; 
  currentIndex: number; 
  unit: TemporaryUnit; 
  theme: ThemeMode; 
  direction: Direction; 
  toasts: ToastMessage[];
  isLoading: boolean;
  autoLocationCityId?: string;
  userTimezoneOffset: number;
  locale: AppLocale;
  open: boolean;
  maxCities: number;
}

export interface WeatherStoreActions {
  addCity: (_city: CityWeather) => void;
  addOrReplaceCurrentLocation: (_city: CityWeather) => void;
  updateCity: (_city: CityWeather) => void;
  removeCity: (_id: string) => void;
  nextCity: () => void;
  prevCity: () => void;
  refreshCity: (_id: string) => void;
  setUnit: (_unit: TemporaryUnit) => void;
  setLocale: (_locale: AppLocale) => void;
  setTheme: (_theme: ThemeMode) => void;
  setCurrentIndex: (_index: number) => void;
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  hideToast: (_id: number) => void;
  setIsLoading: (_isLoading: boolean) => void;
  setUserTimezoneOffset: (_offset: number) => void; 
  getUserTimezoneOffset: () => number; 
  resetStore: () => void;
  setOpen: (_open: boolean) => void;
}
