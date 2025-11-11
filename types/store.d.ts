import { CityWeather, CityWeatherCurrent } from './weather';
import { TemporaryUnit as TemporaryUnit, ThemeMode, Direction, ToastMessage } from './ui';
import { AppLocale } from './i18n';
import { CurrentLocationData } from './location';

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
  isAuthenticated: boolean;
  isSyncing: boolean;
  currentLocationData?: CurrentLocationData;
  locationTrackingEnabled: boolean;
  locationChangeDialog: {
    isOpen: boolean;
    oldCity?: { name: { en: string; he: string }; country: { en: string; he: string } };
    newCity?: { name: { en: string; he: string }; country: { en: string; he: string } };
    distance?: number;
  };
}

export interface WeatherStoreActions {
  addCity: (_city: CityWeather) => Promise<boolean>;
  addOrReplaceCurrentLocation: (_city: CityWeather) => Promise<void>;
  updateCity: (_city: CityWeather) => void;
  removeCity: (_id: string) => Promise<void>;
  nextCity: () => void;
  prevCity: () => void;
  refreshCity: (_id: string, opts?: { background?: boolean }) => Promise<void>;
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
  setIsAuthenticated: (_isAuthenticated: boolean) => void;
  updateCurrentLocation: (lat: number, lon: number, cityId: string) => void;
  setLocationTrackingEnabled: (enabled: boolean) => void;
  showLocationChangeDialog: (oldCity: { name: { en: string; he: string }; country: { en: string; he: string } }, newCity: { name: { en: string; he: string }; country: { en: string; he: string } }, distance: number) => void;
  hideLocationChangeDialog: () => void;
  handleLocationChange: (keepOldCity: boolean, oldCityId: string, newCity: CityWeather) => void;
  loadFromServer: (payload: { cities: unknown[]; currentCityId?: string; user: { locale: string; unit: string } }) => void;
  setCurrentCity: (id: string) => void;
  applyBackgroundUpdate: (id: string, data: { lastUpdatedUtc: string } & Partial<CityWeather>) => void;
}
