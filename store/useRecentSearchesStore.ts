import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface City {
  name: string;
  country: string;
  temp?: string;
}

interface RecentSearchesStore {
  searches: City[];
  addSearch: (city: City) => void;
  clearSearches: () => void;
}

export const useRecentSearchesStore = create<RecentSearchesStore>()(
  persist(
    (set) => ({
      searches: [],
      addSearch: (city) =>
        set((state) => ({
          searches: [
            city,
            ...state.searches.filter(
              (s) => !(s.name === city.name && s.country === city.country)
            ),
          ].slice(0, 5), // Keep only the 5 most recent searches
        })),
      clearSearches: () => set({ searches: [] }),
    }),
    {
      name: 'recent-searches',
    }
  )
);
