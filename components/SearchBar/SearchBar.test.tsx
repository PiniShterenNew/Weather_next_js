import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils/renderWithIntl';
import SearchBar from './SearchBar';
import type { CitySuggestion } from '@/types/suggestion';
import type { CityWeather } from '@/types/weather';
import * as weatherModule from '@/features/weather';
import * as fetchReverseModule from '@/features/weather/fetchReverse';

const stateMock = {
  addCity: vi.fn(),
  addOrReplaceCurrentLocation: vi.fn(),
  autoLocationCityId: null as string | null,
  showToast: vi.fn(),
  cities: [] as CityWeather[],
  unit: 'metric',
  setIsLoading: vi.fn(),
};

vi.mock('@/stores/useWeatherStore', () => ({
  useWeatherStore: (selector: any) => selector(stateMock),
  getState: () => stateMock,
}));

beforeEach(() => {
  Object.values(stateMock).forEach((v) => {
    if (typeof v === 'function') v.mockClear();
  });
  stateMock.cities = [];
});

describe('SearchBar', () => {
  describe('UI Rendering & Basic Interaction', () => {
    it('renders search field and current location button with translated texts', () => {
      render(<SearchBar />);
      expect(screen.getByPlaceholderText('Search for a city...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Use current location' })).toBeInTheDocument();
    });

    it('allows typing in search box', () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText('Search for a city...');
      fireEvent.change(input, { target: { value: 'Lon' } });
      expect(input).toHaveValue('Lon');
    });

    it('does not show suggestions if less than 3 characters are typed', async () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText('Search for a city...');
      fireEvent.change(input, { target: { value: 'Lo' } });
      await waitFor(() => {
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
      });
    });

    it('resets suggestions when field is cleared', async () => {
      vi.spyOn(weatherModule, 'fetchSuggestions').mockResolvedValue([
        { id: '2', name: 'Paris', country: 'FR', lat: 48.8, lon: 2.3, displayName: 'Paris, FR', language: 'en' }
      ] as CitySuggestion[]);

      render(<SearchBar />);
      fireEvent.change(screen.getByPlaceholderText('Search for a city...'), { target: { value: 'Par' } });

      await waitFor(() => {
        expect(screen.getByText('Paris, FR')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByPlaceholderText('Search for a city...'), { target: { value: '' } });

      await waitFor(() => {
        expect(screen.queryByText('Paris, FR')).not.toBeInTheDocument();
      });
    });

    it('does not show current location button if autoLocationCityId exists', () => {
      stateMock.autoLocationCityId = 'current_32.08_34.78';
      render(<SearchBar />);
      expect(screen.queryByRole('button', { name: 'Use current location' })).not.toBeInTheDocument();
      stateMock.autoLocationCityId = null;
    });
  });

  describe('Suggestions & City Selection Flow', () => {
    it('displays search suggestions', async () => {
      vi.spyOn(weatherModule, 'fetchSuggestions').mockResolvedValue([
        { id: '1', name: 'London', country: 'GB', lat: 51.5, lon: -0.12, displayName: 'London, GB', language: 'en' }
      ] as CitySuggestion[]);

      render(<SearchBar />);
      fireEvent.change(screen.getByPlaceholderText('Search for a city...'), {
        target: { value: 'Lon' }
      });

      await waitFor(() => {
        expect(screen.getByText('London, GB')).toBeInTheDocument();
      });
    });

    it('selecting suggestion from list triggers fetchWeather and adds city', async () => {
      vi.spyOn(weatherModule, 'fetchSuggestions').mockResolvedValue([
        { id: '1', name: 'London', country: 'GB', lat: 51.5, lon: -0.12, displayName: 'London, GB', language: 'en' }
      ] as CitySuggestion[]);

      vi.spyOn(weatherModule, 'fetchWeather').mockResolvedValue({
        id: '1',
        name: 'London',
        country: 'GB',
        lat: 51.5,
        lon: -0.12,
        lang: 'en',
        current: {
          temp: 20, feelsLike: 19, desc: 'Sunny', icon: '01d', humidity: 50, wind: 5,
          windDeg: 90, pressure: 1012, visibility: 10000, clouds: 0,
          sunrise: 1680000000, sunset: 1680040000, timezone: 7200,
        },
        forecast: [],
        lastUpdated: Date.now(),
        unit: 'metric',
      });

      render(<SearchBar />);
      fireEvent.change(screen.getByPlaceholderText('Search for a city...'), {
        target: { value: 'Lon' }
      });

      await waitFor(() => {
        expect(screen.getByText('London, GB')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('London, GB'));

      await waitFor(() => {
        expect(stateMock.addCity).toHaveBeenCalled();
      });
    });

    it('shows toast when trying to add city that already exists', async () => {
      stateMock.cities = [
        {
          id: '1',
          name: 'London',
          country: 'GB',
          lat: 51.5,
          lon: -0.12,
          lang: 'en',
          current: {
            temp: 20,
            feelsLike: 19,
            desc: 'Sunny',
            icon: '01d',
            humidity: 50,
            wind: 5,
            windDeg: 90,
            pressure: 1012,
            visibility: 10000,
            clouds: 0,
            sunrise: 1680000000,
            sunset: 1680040000,
            timezone: 7200,
          },
          forecast: [],
          lastUpdated: Date.now(),
          unit: 'metric',
        }
      ];

      vi.spyOn(weatherModule, 'fetchSuggestions').mockResolvedValue([
        { id: '1', name: 'London', country: 'GB', lat: 51.5, lon: -0.12, displayName: 'London, GB', language: 'en' }
      ]);

      render(<SearchBar />);
      fireEvent.change(screen.getByPlaceholderText('Search for a city...'), {
        target: { value: 'Lon' }
      });

      await waitFor(() => {
        expect(screen.getByText('London, GB')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('London, GB'));

      await waitFor(() => {
        expect(stateMock.showToast).toHaveBeenCalled();
        expect(stateMock.addCity).not.toHaveBeenCalled();
      });
    });
  });

  describe('Current Location Flow', () => {
    it('shows toast when geolocation is not supported', async () => {
      const orig = global.navigator.geolocation;
      // @ts-ignore
      delete global.navigator.geolocation;

      render(<SearchBar />);
      fireEvent.click(screen.getByRole('button', { name: 'Use current location' }));

      await waitFor(() => {
        expect(stateMock.showToast).toHaveBeenCalledWith({
          message: 'errors.geolocationNotSupported',
        });
      });

      if (orig) {
        // @ts-ignore
        global.navigator.geolocation = orig;
      }
    });

    it('adds city from current location and shows toast', async () => {
      const mockCoords = { latitude: 32.08, longitude: 34.78 };
      // @ts-ignore
      global.navigator.geolocation = {
        getCurrentPosition: (success: any) =>
          success({ coords: mockCoords }),
      };

      vi.spyOn(fetchReverseModule, 'fetchReverse').mockResolvedValue({
        name: 'Tel Aviv',
        country: 'IL',
        lat: 32.08,
        lon: 34.78
      });
      vi.spyOn(weatherModule, 'fetchWeather').mockResolvedValue({
        id: '2', name: 'Tel Aviv', country: 'IL', lat: 32.08, lon: 34.78, lang: 'he',
        current: {
          temp: 25, feelsLike: 26, desc: 'Clear', icon: '01d',
          humidity: 45, wind: 5, windDeg: 120, pressure: 1015,
          visibility: 10000, clouds: 0, sunrise: 1680000000,
          sunset: 1680040000, timezone: 7200
        }, forecast: [], lastUpdated: Date.now(), unit: 'metric'
      } as CityWeather);

      render(<SearchBar />);
      fireEvent.click(screen.getByRole('button', { name: 'Use current location' }));

      await waitFor(() => {
        expect(stateMock.addOrReplaceCurrentLocation).toHaveBeenCalled();
        expect(stateMock.showToast).toHaveBeenCalledWith({
          message: 'toasts.locationAdded',
          values: { name: 'Tel Aviv' }
        });
      });
    });
  });

  describe('Loading and Error Handling', () => {
    it('setIsLoading stops even in case of API error', async () => {
      vi.spyOn(weatherModule, 'fetchSuggestions').mockResolvedValue([
        { id: '2', name: 'Paris', country: 'FR', lat: 48.8, lon: 2.3, displayName: 'Paris, FR', language: 'en' }
      ] as CitySuggestion[]);

      vi.spyOn(weatherModule, 'fetchWeather').mockRejectedValue(new Error('API error'));

      render(<SearchBar />);
      fireEvent.change(screen.getByPlaceholderText('Search for a city...'), {
        target: { value: 'Par' }
      });

      await waitFor(() => {
        expect(screen.getByText('Paris, FR')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Paris, FR'));

      await waitFor(() => {
        expect(stateMock.setIsLoading).toHaveBeenCalledWith(true);
        expect(stateMock.setIsLoading).toHaveBeenCalledWith(false);
        expect(stateMock.addCity).not.toHaveBeenCalled();
        expect(stateMock.showToast).toHaveBeenCalled();
      });
    });

    it('shows toast if fetchWeather or fetchReverse fails during current location', async () => {
      const mockCoords = { latitude: 32.08, longitude: 34.78 };

      // @ts-ignore
      global.navigator.geolocation = {
        getCurrentPosition: (success: any) => success({ coords: mockCoords }),
      };

      vi.spyOn(fetchReverseModule, 'fetchReverse').mockResolvedValue({
        name: 'Tel Aviv',
        country: 'IL',
        lat: 32.08,
        lon: 34.78
      });

      vi.spyOn(weatherModule, 'fetchWeather').mockRejectedValue(new Error('fail'));

      render(<SearchBar />);
      fireEvent.click(screen.getByRole('button', { name: 'Use current location' }));

      await waitFor(() => {
        expect(stateMock.showToast).toHaveBeenCalledWith({
          message: 'errors.fetchLocationWeather',
        });
      });
    });

    it('shows toast if user denies geolocation access', async () => {
      // @ts-ignore
      global.navigator.geolocation = {
        getCurrentPosition: (_success: any, error: any) => error(),
      };

      render(<SearchBar />);
      fireEvent.click(screen.getByRole('button', { name: 'Use current location' }));

      await waitFor(() => {
        expect(stateMock.showToast).toHaveBeenCalledWith({
          message: 'errors.geolocationDenied',
        });
      });
    });

  });
});
