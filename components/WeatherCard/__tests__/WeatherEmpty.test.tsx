// components/WeatherCard/WeatherEmpty.test.tsx
import { fireEvent, render, screen, waitFor } from '@/test/utils/renderWithIntl';
import WeatherEmpty from './WeatherEmpty';
import { vi } from 'vitest';

const mockAddOrReplaceCurrentLocation = vi.fn();
const mockShowToast = vi.fn();
const mockSetIsLoading = vi.fn();
const mockAddCity = vi.fn();

const stateMock = {
    cities: [] as CityWeather[],
    currentIndex: 0,
    unit: 'metric',
    locale: 'he',
    theme: 'system',
    direction: 'ltr',
    toasts: [],
    isLoading: false,
    autoLocationCityId: undefined,
    addOrReplaceCurrentLocation: mockAddOrReplaceCurrentLocation,
    showToast: mockShowToast,
    setIsLoading: mockSetIsLoading,
    addCity: mockAddCity,
};

/* ---------- useWeatherStore ---------- */
vi.mock('@/stores/useWeatherStore', () => {
    const store = (selector: any) => selector(stateMock);
    store.getState = () => stateMock;           // <--- מאפיין על האובייקט‐פונקציה
    return { useWeatherStore: store };
});

/* ---------- fetchReverse ---------- */
vi.mock('@/features/weather/fetchReverse', () => ({
    fetchReverse: vi.fn(),
}));
import { fetchReverse } from '@/features/weather/fetchReverse';
const mockFetchReverse = vi.mocked(fetchReverse);

/* ---------- fetchWeather ---------- */
vi.mock('@/features/weather', () => ({
    fetchWeather: vi.fn(),
}));
import { fetchWeather } from '@/features/weather';
import { CityWeather } from '@/types/weather';
const mockFetchWeather = vi.mocked(fetchWeather);

/* ---------- סביבה ---------- */
beforeEach(() => {
    vi.resetAllMocks();
    Object.defineProperty(global.navigator, 'geolocation', {
        value: { getCurrentPosition: vi.fn() },
        configurable: true,
    });
});

afterEach(() => {
    vi.restoreAllMocks();
});

/* ---------- טסט ---------- */
describe('WeatherEmpty', () => {
    it('adds current location and shows toast when geolocation succeeds', async () => {
        const coords = { latitude: 32.07, longitude: 34.79 };
        const cityInfo = { name: 'Tel Aviv', country: 'IL' };
        const weatherData = {
            id: 'weatherId',
            name: 'Tel Aviv',
            country: 'IL',
            lat: coords.latitude,
            lon: coords.longitude,
        };

        mockFetchReverse.mockResolvedValueOnce(cityInfo as any);
        mockFetchWeather.mockResolvedValueOnce(weatherData as any);

        (navigator.geolocation.getCurrentPosition as any).mockImplementationOnce(
            (success: any) => success({ coords })
        );

        render(<WeatherEmpty />);

        fireEvent.click(screen.getByTestId('add-current-location-button'));

        await waitFor(() => {
            expect(mockSetIsLoading).toHaveBeenCalledWith(true);
            expect(mockFetchReverse).toHaveBeenCalledWith(
                coords.latitude,
                coords.longitude,
                'en'
            );
            expect(mockFetchWeather).toHaveBeenCalledWith(
                expect.objectContaining({
                    lat: coords.latitude,
                    lon: coords.longitude,
                    name: cityInfo.name,
                    country: cityInfo.country,
                    unit: 'metric',
                    lang: 'en',
                })
            );
            expect(mockAddOrReplaceCurrentLocation).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...weatherData,
                    id: expect.stringContaining('current_'),
                    isCurrentLocation: true,
                })
            );
            expect(mockShowToast).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: "toasts.locationAdded",
                    values: {
                        name: "Tel Aviv",
                    },
                })
            );
            expect(mockSetIsLoading).toHaveBeenCalledWith(false);
        });
    });

    it('adds a popular city when clicked', async () => {
        const weatherData = {
            id: 'test',
            name: 'New York',
            country: 'US',
            lat: 40.7128,
            lon: -74.0060,
        };

        mockFetchWeather.mockResolvedValueOnce(weatherData as CityWeather);

        stateMock.cities = [];

        render(<WeatherEmpty />);
        fireEvent.click(screen.getByText(/New York/i));

        await waitFor(() => {
            expect(mockSetIsLoading).toHaveBeenCalledWith(true);
            expect(mockFetchWeather).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'New York', // ⬅️ שונה מ־'popular.cities.newYork'
                    lat: 40.7128,
                    lon: -74.0060,
                    country: 'US',
                    unit: 'metric',
                    lang: 'en', // ⬅️ שונה מ־'he'
                })
            );
            expect(mockAddCity).toHaveBeenCalledWith(weatherData);
            expect(mockShowToast).toHaveBeenCalledWith({
                message: "toasts.added",
                values: {
                    name: "New York",
                },
            });
            expect(mockSetIsLoading).toHaveBeenCalledWith(false);
        });
    });

    it('shows error toast if fetchWeather fails for popular city', async () => {
        mockFetchWeather.mockRejectedValueOnce(new Error('API failed'));

        stateMock.cities = [];

        render(<WeatherEmpty />);

        fireEvent.click(screen.getByText(/New York/i));

        await waitFor(() => {
            expect(mockSetIsLoading).toHaveBeenCalledWith(true);
            expect(mockFetchWeather).toHaveBeenCalled();
            expect(mockShowToast).toHaveBeenCalledWith({
                message: 'toasts.error',
            });
            expect(mockSetIsLoading).toHaveBeenCalledWith(false);
        });
    });

    it('does not add popular city if it already exists', async () => {
        const existingCity = {
            id: 'existing',
            name: 'New York',
            country: 'US',
            lat: 40.7128,
            lon: -74.0060,
        };

        stateMock.cities = [existingCity as CityWeather];

        render(<WeatherEmpty />);

        fireEvent.click(screen.getByText(/New York/i));

        await waitFor(() => {
            expect(mockFetchWeather).not.toHaveBeenCalled();
            expect(mockShowToast).toHaveBeenCalledWith({
                message: 'toasts.exists',
            });
            expect(mockSetIsLoading).toHaveBeenCalledWith(false);
        });
    });

    it('shows toast when geolocation fails', async () => {
        (navigator.geolocation.getCurrentPosition as any).mockImplementationOnce(
            (_success: any, error: any) => error({ code: 1, message: 'Permission denied' })
        );

        render(<WeatherEmpty />);

        fireEvent.click(screen.getByTestId('add-current-location-button'));

        await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith({
                message: 'errors.geolocationDenied',
            });
            expect(mockSetIsLoading).toHaveBeenCalledWith(false);
        });
    });

    it('shows toast when fetchReverse fails', async () => {
        (navigator.geolocation.getCurrentPosition as any).mockImplementationOnce(
            (success: any) => success({ coords: { latitude: 32.07, longitude: 34.79 } })
        );

        mockFetchReverse.mockRejectedValueOnce(new Error('Reverse geocoding failed'));

        render(<WeatherEmpty />);

        fireEvent.click(screen.getByTestId('add-current-location-button'));

        await waitFor(() => {
            expect(mockFetchReverse).toHaveBeenCalled();
            expect(mockShowToast).toHaveBeenCalledWith({
                message: 'errors.fetchLocationWeather',
            });
            expect(mockSetIsLoading).toHaveBeenCalledWith(false);
        });
    });

    it('shows toast when fetchWeather fails after fetchReverse success', async () => {
        const coords = { latitude: 32.07, longitude: 34.79 };
        const cityInfo = { name: 'Tel Aviv', country: 'IL' };

        (navigator.geolocation.getCurrentPosition as any).mockImplementationOnce(
            (success: any) => success({ coords })
        );

        mockFetchReverse.mockResolvedValueOnce(cityInfo as any);
        mockFetchWeather.mockRejectedValueOnce(new Error('Weather fetch failed'));

        render(<WeatherEmpty />);

        fireEvent.click(screen.getByTestId('add-current-location-button'));

        await waitFor(() => {
            expect(mockFetchReverse).toHaveBeenCalled();
            expect(mockFetchWeather).toHaveBeenCalled();
            expect(mockShowToast).toHaveBeenCalledWith({
                message: 'errors.fetchLocationWeather',
            });
            expect(mockSetIsLoading).toHaveBeenCalledWith(false);
        });
    });

    it('shows toast when geolocation is not supported', async () => {
        // מחק את geolocation
        Object.defineProperty(global.navigator, 'geolocation', {
            value: undefined,
            configurable: true,
        });

        render(<WeatherEmpty />);

        fireEvent.click(screen.getByTestId('add-current-location-button'));

        await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith({
                message: "errors.geolocationNotSupported",
            });
            expect(mockSetIsLoading).not.toHaveBeenCalled();
        });
    });

});
