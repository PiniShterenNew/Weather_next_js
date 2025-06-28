export interface CitySuggestion {
  id: string; 
  name: string; 
  country: string; 
  lat: number; 
  lon: number; 
  displayName: string;
  language: 'he' | 'en'; 
}
