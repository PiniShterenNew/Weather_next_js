// types/reverse.d.ts

export interface CityInfo {
  id: string;
  lat: number;
  lon: number;
  city: {
    en: string;
    he: string;
  };
  country: {
    en: string;
    he: string;
  };
}