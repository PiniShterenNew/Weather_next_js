/**
 * Cities Feature Types
 * Type definitions for cities-related functionality
 */

import { AppLocale } from '@/types/i18n';

// City Data Types
export interface CityData {
  id: string;
  lat: number;
  lon: number;
  city: {
    he: string;
    en: string;
  };
  country: {
    he: string;
    en: string;
  };
}

// City Component Props
export interface CityGridProps {
  cities: CityData[];
  onCitySelect: (city: CityData) => void;
  className?: string;
}

export interface CityListItemProps {
  city: CityData;
  onSelect: (city: CityData) => void;
  onRemove?: (city: CityData) => void;
  isSelected?: boolean;
  className?: string;
}

export interface CitiesListProps {
  cities: CityData[];
  onCitySelect: (city: CityData) => void;
  onCityRemove?: (city: CityData) => void;
  selectedCityId?: string;
  className?: string;
}

// City API Types
export interface CitySearchInput {
  query: string;
  locale: AppLocale;
}

export interface CitySearchResponse {
  success: boolean;
  data?: CityData[];
  error?: string;
}

export interface ReverseGeocodeInput {
  lat: number;
  lon: number;
  locale: AppLocale;
}

export interface ReverseGeocodeResponse {
  success: boolean;
  data?: CityData;
  error?: string;
}

// City Store Types
export interface CitiesStoreState {
  cities: CityData[];
  selectedCityId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface CitiesStoreActions {
  addCity: (city: CityData) => void;
  removeCity: (id: string) => void;
  selectCity: (id: string) => void;
  clearSelection: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export type CitiesStore = CitiesStoreState & CitiesStoreActions;
