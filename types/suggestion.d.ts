// types/suggestion.d.ts

import { CityTranslation } from "./cache";

export interface CitySuggestion {
  id: string;
  lat: number;
  lon: number;
  city: CityTranslation;
  country: CityTranslation;
}