import { render, screen, fireEvent, waitFor } from '@/test/utils/renderWithIntl';
import { vi } from 'vitest';

vi.mock('@/constants/popularCities', () => ({
  POPULAR_CITIES: [
    { id: 'newYork', lat: 40.7128, lon: -74.0060, country: 'US' },
    { id: 'london', lat: 51.5074, lon: -0.1278, country: 'GB' },
  ],
}));

vi.mock('@/features/weather', () => ({
  fetchWeather: vi.fn(async () => ({
    id: 'london',
    name: 'London',
    lat: 51.5074,
    lon: -0.1278,
    country: 'GB',
    current: { temp: 25, feelsLike: 26, desc: 'Clear', icon: '01d' },
  })),
}));

const mockAddCity = vi.fn();
const mockShowToast = vi.fn();
const mockSetIsLoading = vi.fn();

function mockWeatherStore(stateOverride: any) {
  vi.doMock('@/stores/useWeatherStore', () => ({
    useWeatherStore: (selector: any) =>
      selector({
        unit: 'metric',
        cities: [],
        addCity: mockAddCity,
        showToast: mockShowToast,
        setIsLoading: mockSetIsLoading,
        ...stateOverride,
      }),
  }));
}

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

describe('QuickCityAdd', () => {
  it('renders nothing if all popular cities already exist', async () => {
    mockWeatherStore({
      cities: [
        { lat: 40.7128, lon: -74.0060 },
        { lat: 51.5074, lon: -0.1278 },
      ],
    });
    const { QuickCityAdd } = await import('../QuickCityAdd');
    const { container } = render(<QuickCityAdd />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the quick add button if cities are available', async () => {
    mockWeatherStore({ cities: [{ lat: 40.7128, lon: -74.0060 }] });
    const { QuickCityAdd } = await import('../QuickCityAdd');
    render(<QuickCityAdd />);
    expect(screen.getByRole('button', { name: /\+/ })).toBeInTheDocument();
  });

  it('adds a city when city button is clicked', async () => {
    mockWeatherStore({ cities: [{ lat: 40.7128, lon: -74.0060 }] });
    const { QuickCityAdd } = await import('../QuickCityAdd');
    render(<QuickCityAdd />);
    fireEvent.click(screen.getByRole('button', { name: /\+/ }));
    const londonButton = await screen.findByText(/London/i);
    fireEvent.click(londonButton);

    await waitFor(() => {
      expect(mockSetIsLoading).toHaveBeenCalledWith(true);
      expect(mockAddCity).toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith({
        message: 'toasts.added',
        values: { name: 'London' },
      });
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });
  });

  it('shows error toast if fetchWeather fails', async () => {
    vi.doMock('@/features/weather', () => ({
      fetchWeather: vi.fn(() => Promise.reject('error')),
    }));
    mockWeatherStore({ cities: [{ lat: 40.7128, lon: -74.0060 }] });

    const { QuickCityAdd } = await import('../QuickCityAdd');
    render(<QuickCityAdd />);
    fireEvent.click(screen.getByRole('button', { name: /\+/ }));
    const londonButton = await screen.findByText(/London/i);
    fireEvent.click(londonButton);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith({ message: 'toasts.error' });
    });
  });
});
