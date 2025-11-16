/**
 * Weather Feature Exports
 * Central export point for weather feature
 */

// Components
export { default as WeatherDetails } from './components/WeatherDetails';
export { default as WeatherTimeNow } from './components/WeatherTimeNow';
export { default as ForecastList } from './components/ForecastList';
export { default as WeatherCardContent } from './components/card/WeatherCardContent';
export { default as WeatherCardSkeleton } from './components/card/WeatherCardSkeleton';
export { default as SwipeableWeatherCard } from './components/card/SwipeableWeatherCard';
export { default as CityPagination } from './components/card/CityPagination';
export { default as CityInfo } from './components/card/CityInfo';
export { default as CityHeader } from './components/card/CityHeader';

// API
export { WeatherService, weatherService } from './api/weatherService';

// API Functions
export { fetchWeather } from './fetchWeather';
export { default as fetchSuggestions } from './fetchSuggestions';
export { fetchReverse } from './fetchReverse';

// Hooks
export { useCityRefresh } from './hooks/useCityRefresh';

// Types
export type {
  WeatherData,
  WeatherCardProps,
  WeatherDetailsProps,
  WeatherTimeNowProps,
  WeatherIconProps,
  FetchWeatherInput,
  WeatherApiResponse,
  WeatherStoreState,
  WeatherStoreActions,
  WeatherStore,
} from './types';