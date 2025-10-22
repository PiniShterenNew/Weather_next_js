export interface UserCurrentLocation {
  id: string;
  userId: string;
  cityId: string;
  lat: number;
  lon: number;
  lastCheckedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  city?: {
    id: string;
    lat: number;
    lon: number;
    cityEn: string;
    cityHe: string;
    countryEn: string;
    countryHe: string;
  };
}

export interface LocationChangeResult {
  changed: boolean;
  distance: number;
  oldCity?: {
    id: string;
    name: { en: string; he: string };
    country: { en: string; he: string };
    lat: number;
    lon: number;
  };
  newCity?: {
    id: string;
    name: { en: string; he: string };
    country: { en: string; he: string };
    lat: number;
    lon: number;
  };
}

export interface LocationCheckResponse {
  changed: boolean;
  distance: number;
  oldCity?: {
    id: string;
    name: { en: string; he: string };
    country: { en: string; he: string };
    lat: number;
    lon: number;
  };
  newCity?: {
    id: string;
    name: { en: string; he: string };
    country: { en: string; he: string };
    lat: number;
    lon: number;
  };
}

export interface LocationChangeNotification {
  type: 'location-change';
  oldCity: {
    name: { en: string; he: string };
    country: { en: string; he: string };
  };
  newCity: {
    name: { en: string; he: string };
    country: { en: string; he: string };
  };
  distance: number;
}

export interface CurrentLocationData {
  lat: number;
  lon: number;
  cityId: string;
  lastChecked: number;
}
