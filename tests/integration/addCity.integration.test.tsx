// test/integration/addCity.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import heMessages from '@/locales/he.json';
import enMessages from '@/locales/en.json';
import { QuickCityAddModal } from '@/components/QuickAdd/QuickCityAddModal';
import { useWeatherStore } from '@/store/useWeatherStore';
import { fetchSuggestions, fetchWeather, FetchWeatherInput } from '@/features/weather';
import { CityWeather } from '@/types/weather';
import { cityWeather } from '../fixtures/cityWeather';

// Mock the external API calls
vi.mock('@/features/weather', () => ({
  fetchSuggestions: vi.fn(),
  fetchWeather: vi.fn(),
  weatherService: {
    fetchWeather: vi.fn()
  }
}));

const mockTelAviv = {
  id: '123',
  city: { en: 'Tel Aviv', he: 'תל אביב' },
  country: { en: 'Israel', he: 'ישראל' },
  lat: 32.0853,
  lon: 34.7818
};

const mockLondon = {
  id: '456',
  city: { en: 'London', he: 'לונדון' },
  country: { en: 'United Kingdom', he: 'בריטניה' },
  lat: 51.5074,
  lon: 0.1278
};

const mockParis = {
  id: 'city:48.8566_2.3522',
  city: { en: 'Paris', he: 'פריז' },
  country: { en: 'France', he: 'צרפת' },
  lat: 48.8566,
  lon: 2.3522
};

const telAvivWeather: CityWeather = {
  ...cityWeather,
  name: { en: 'Tel Aviv', he: 'תל אביב' },
  country: { en: 'Israel', he: 'ישראל' },
  lat: 32.0853,
  lon: 34.7818,
};

const mockLondonWeather: CityWeather = {
  ...cityWeather,
  name: { en: 'London', he: 'לונדון' },
  country: { en: 'United Kingdom', he: 'בריטניה' },
  lat: 51.5074,
  lon: 0.1278,
};

const mockParisWeather: CityWeather = {
  ...cityWeather,
  id: 'city:48.8566_2.3522',
  name: { en: 'Paris', he: 'פריז' },
  country: { en: 'France', he: 'צרפת' },
  lat: 48.8566,
  lon: 2.3522,
};

const mockWeatherResponse = (city: typeof mockTelAviv) => ({
  id: city.id,
  name: city.city,
  country: city.country,
  lat: city.lat,
  lon: city.lon,
  temp: 25,
  feels_like: 26,
  humidity: 60,
  wind_speed: 5,
  description: 'Clear',
  icon: '01d',
  lastUpdated: Date.now(),
});

describe('Add City Integration Flow', () => {
  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();

    // Reset the store before each test
    const resetStore = useWeatherStore.getState().resetStore;
    resetStore();

    // Open the modal by default
    useWeatherStore.setState({ open: true });

    // Default mock implementation
    (fetchSuggestions as any).mockResolvedValue([mockTelAviv]);
    (fetchWeather as any).mockImplementation((params: any) => {
      if (params.id === mockLondonWeather.id) return Promise.resolve(mockLondonWeather);
      if (params.id === telAvivWeather.id) return Promise.resolve(telAvivWeather);
      if (params.id === mockParisWeather.id) return Promise.resolve(mockParisWeather);
      return Promise.resolve(telAvivWeather);
    });
    
    // Mock weatherService.fetchWeather
    const { weatherService } = await import('@/features/weather');
    (weatherService.fetchWeather as any).mockImplementation((params: any) => {
      if (params.id === mockLondonWeather.id) return Promise.resolve({ success: true, data: mockLondonWeather });
      if (params.id === telAvivWeather.id) return Promise.resolve({ success: true, data: telAvivWeather });
      if (params.id === 'city:48.8566_2.3522') return Promise.resolve({ success: true, data: mockParisWeather });
      return Promise.resolve({ success: true, data: telAvivWeather });
    });
  });

  it('should search for a city in Hebrew, select it, and add it to the store', async () => {
    const user = userEvent.setup();

    render(
      <NextIntlClientProvider locale="he" messages={heMessages}>
        <QuickCityAddModal />
      </NextIntlClientProvider>
    );

    // 1. Verify modal is open
    expect(screen.getAllByRole('heading', { name: /Weather/i })).toHaveLength(2);

    // 2. The search input should be visible (no tabs in this modal)
    expect(screen.getByTestId('city-search-input')).toBeInTheDocument();

    // 3. Type in search box
    const searchInput = screen.getByTestId('city-search-input');
    await user.type(searchInput, 'תל אביב');

    // 4. Verify API was called with correct parameters
    await waitFor(() => {
      expect(fetchSuggestions).toHaveBeenCalledWith('תל אביב', 'he');
    });

    // 5. Wait for suggestions to appear
    await waitFor(() => {
      expect(screen.getByText('תל אביב')).toBeInTheDocument();
    });

    // 6. Select the city from suggestions
    await user.click(screen.getByText('תל אביב'));

    // 7. Verify weather API was called with correct parameters
    await waitFor(() => {
      expect(fetchWeather).toHaveBeenCalledWith(
        expect.objectContaining({ id: mockTelAviv.id })
      );
    });

    // 8. Verify the city was added to the store
    await waitFor(() => {
      const cities = useWeatherStore.getState().cities;
      expect(cities.length).toBe(1);
      expect(cities[0].name.he).toBe('תל אביב');
    });

    // 9. Verify toast was shown
    await waitFor(() => {
      expect(useWeatherStore.getState().toasts.length).toBeGreaterThan(0);
      expect(useWeatherStore.getState().toasts[0].type).toBe('success');
    });

    // 10. Verify modal was closed
    expect(useWeatherStore.getState().open).toBe(false);
  });

  it('should search for a city in English, select it, and add it to the store', async () => {
    const user = userEvent.setup();

    // Setup English locale
    useWeatherStore.setState({ locale: 'en' });

    render(
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <QuickCityAddModal />
      </NextIntlClientProvider>
    );

    // 1. Verify modal is open with English text
    expect(screen.getAllByRole('heading', { name: /Weather/i })).toHaveLength(2);

    // 2. The search input should be visible (no tabs in this modal)
    expect(screen.getByTestId('city-search-input')).toBeInTheDocument();

    // 3. Type in search box
    const searchInput = screen.getByTestId('city-search-input');
    await user.type(searchInput, 'London');

    // Mock the English search response
    (fetchSuggestions as any).mockResolvedValue([mockLondon]);

    // 4. Verify API was called with correct parameters
    await waitFor(() => {
      expect(fetchSuggestions).toHaveBeenCalledWith('London', 'en');
    });

    // 5. Wait for suggestions to appear
    await waitFor(() => {
      expect(screen.getAllByText('London')).toHaveLength(2);
    });

    // 6. Select the city from suggestions (use the first one)
    await user.click(screen.getAllByText('London')[0]);

    // 7. Verify weather API was called with correct parameters
    await waitFor(() => {
      expect(fetchWeather).toHaveBeenCalledWith(
        expect.objectContaining({ id: mockLondon.id })
      );
    });

    // 8. Verify the city was added to the store
    await waitFor(() => {
      const cities = useWeatherStore.getState().cities;
      expect(cities.length).toBe(1);
      expect(cities[0].name.en).toBe('Tel Aviv');
    });
  });

  it('should prevent adding a city that already exists', async () => {
    const user = userEvent.setup();

    // Add Tel Aviv to the store first
    useWeatherStore.getState().addCity(telAvivWeather);
    useWeatherStore.getState().setOpen(true);
    (fetchWeather as any).mockResolvedValue(telAvivWeather);

    render(
      <NextIntlClientProvider locale="he" messages={heMessages}>
        <QuickCityAddModal />
      </NextIntlClientProvider>
    );

    // The search input should be visible (no tabs in this modal)
    expect(screen.getByTestId('city-search-input')).toBeInTheDocument();

    // Type in search box
    const searchInput = screen.getByTestId('city-search-input');
    await user.type(searchInput, 'תל אביב');

    // Wait for suggestions to appear
    await waitFor(() => {
      expect(screen.getByText('תל אביב')).toBeInTheDocument();
    });

    // Select the city from suggestions
    await user.click(screen.getByText('תל אביב'));

    // Verify info toast was shown
    await waitFor(() => {
      expect(useWeatherStore.getState().toasts.length).toBeGreaterThan(0);
      expect(useWeatherStore.getState().toasts[0].type).toBe('info');
    });
  });

  it('should show warning when maximum cities limit is reached', async () => {
    const user = userEvent.setup();

    // Add max cities to the store
    const maxCities = useWeatherStore.getState().maxCities;
    const mockCities = Array(maxCities).fill(null).map((_, i) => ({
      ...mockWeatherResponse(mockParis),
      id: `city-${i}`,
      name: { en: `City ${i}`, he: `עיר ${i}` }
    }));

    useWeatherStore.setState({ cities: mockCities as unknown as CityWeather[] });

    render(
      <NextIntlClientProvider locale="he" messages={heMessages}>
        <QuickCityAddModal />
      </NextIntlClientProvider>
    );

    // The search input should be visible (no tabs in this modal)
    expect(screen.getByTestId('city-search-input')).toBeInTheDocument();

    // Type in search box
    const searchInput = screen.getByTestId('city-search-input');
    await user.type(searchInput, 'לונדון');

    // Mock the search response
    (fetchSuggestions as any).mockResolvedValue([mockLondon]);

    // Wait for suggestions to appear
    await waitFor(() => {
      expect(screen.getByText('לונדון')).toBeInTheDocument();
    });

    // Select the city from suggestions
    await user.click(screen.getByText('לונדון'));

    // Verify the city was NOT added
    await waitFor(() => {
      const cities = useWeatherStore.getState().cities;
      expect(cities.length).toBe(maxCities); // Still just maxCities
    });

    // Verify warning toast was shown
    expect(useWeatherStore.getState().toasts.length).toBeGreaterThan(0);
    expect(useWeatherStore.getState().toasts[0].type).toBe('warning');
    expect(useWeatherStore.getState().toasts[0].message).toBe('toasts.maxCities');
  });

  it('should add a city from popular cities tab', async () => {
    const user = userEvent.setup();

    render(
      <NextIntlClientProvider locale="he" messages={heMessages}>
        <QuickCityAddModal />
      </NextIntlClientProvider>
    );

    // 1. Verify modal is open
    expect(screen.getAllByRole('heading', { name: /Weather/i })).toHaveLength(2);

    // 2. Find a city in the popular list (e.g., Paris)
    // Note: The cities are displayed directly without continent sections
    const parisButton = await waitFor(() => {
      return screen.getByRole('button', { name: /פריז/ });
    });

    // 4. Click on the city
    await user.click(parisButton);

    // 5. Verify weather API was called
    await waitFor(() => {
      expect(fetchWeather).toHaveBeenCalledWith(
        expect.objectContaining({ id: "city:48.8566_2.3522" })
      );
    });

    // 6. Verify the city was added to the store
    await waitFor(() => {
      const cities = useWeatherStore.getState().cities;
      expect(cities.length).toBe(1);
    });

    // 7. Verify modal was closed
    expect(useWeatherStore.getState().open).toBe(false);
  }, 10000);

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup();

    // Mock API error
    (fetchSuggestions as any).mockRejectedValue(new Error('API Error'));

    render(
      <NextIntlClientProvider locale="he" messages={heMessages}>
        <QuickCityAddModal />
      </NextIntlClientProvider>
    );

    // The search input should be visible (no tabs in this modal)
    expect(screen.getByTestId('city-search-input')).toBeInTheDocument();

    // Type in search box
    const searchInput = screen.getByTestId('city-search-input');
    await user.type(searchInput, 'תל אביב');

    // Verify no suggestions appear and error state is shown
    await waitFor(() => {
      expect(screen.getByText(/לא נמצאו ערים/i)).toBeInTheDocument();
    });
  });
});