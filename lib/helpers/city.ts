import { CityWeather } from '@/types/weather';

/**
 * Checks if a city already exists in the cities array
 * @param cities - Array of existing city weather data
 * @param newCity - New city to check for existence
 * @returns True if the city exists in the array, false otherwise
 */
export const isCityExists = (cities: CityWeather[], newCity: CityWeather) => {
  return cities.some(
    (city) =>
      city.id === newCity.id || // Check by ID
      (city.lat.toFixed(2) === newCity.lat.toFixed(2) && city.lon.toFixed(2) === newCity.lon.toFixed(2)) || // Check by coordinates
      (city.name.en === newCity.name.en &&
        city.country.en === newCity.country.en) // Check by name and country
  );
};

