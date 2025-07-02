// lib/cityNamesCache.ts
interface CityTranslation {
    en: string;
    he: string;
  }
  
  interface CityCache {
    cities: Record<string, CityTranslation>;
    countries: Record<string, CityTranslation>;
  }
  
  export const cityNamesCache: CityCache = {
    cities: {
      "Tel Aviv": { en: "Tel Aviv", he: "תל אביב" },
      "London": { en: "London", he: "לונדון" },
    },
    countries: {
      "Israel": { en: "Israel", he: "ישראל" },
      "United Kingdom": { en: "United Kingdom", he: "בריטניה" },
    }
  };