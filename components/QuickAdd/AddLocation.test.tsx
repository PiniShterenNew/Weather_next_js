import { render, screen, waitFor } from "@/test/utils/renderWithIntl";
import AddLocation from "./AddLocation";
import * as fetchReverseModule from '@/features/weather/fetchReverse';
import * as fetchWeatherModule from '@/features/weather';
let mockStore: any;

vi.mock('@/stores/useWeatherStore', () => ({
    useWeatherStore: (selector = (s: any) => s) => selector(mockStore),
}));

const mockFetchReverse = vi.spyOn(fetchReverseModule, "fetchReverse");
const mockFetchWeather = vi.spyOn(fetchWeatherModule, "fetchWeather");

beforeEach(() => {
    mockStore = {
        autoLocationCityId: undefined, // Changed from null to undefined
        setIsLoading: vi.fn(),
        showToast: vi.fn(),
        addOrReplaceCurrentLocation: vi.fn(),
        setOpen: vi.fn(),
        unit: 'metric',
        locale: 'en',
    };
});

describe('AddLocation', () => {
    it('renders AddLocation button', () => {
        render(<AddLocation size="icon" type="icon" />);
        expect(screen.getByTestId('add-location')).toBeInTheDocument();
    });

    it('renders AddLocation button with text', () => {
        render(<AddLocation size="icon" type="default" />);
        expect(screen.getByText('Add current location')).toBeInTheDocument();
    });

    it('has disabled state when autoLocationCityId is not undefined', () => {
        mockStore.autoLocationCityId = '1';
        render(<AddLocation size="icon" type="icon" />);
        expect(screen.getByTestId('add-location')).toBeDisabled();
    });

    it('shows error toast when geolocation is not supported', () => {
        // Ensure geolocation is not supported
        delete (global.navigator as any).geolocation;

        render(<AddLocation size="icon" type="icon" />);
        screen.getByTestId('add-location').click();

        expect(mockStore.showToast).toHaveBeenCalledWith({
            message: 'errors.geolocationNotSupported',
            type: 'error'
        });
    });

    it('adds location successfully and shows success toast', async () => {
        (global.navigator as any).geolocation = {
            getCurrentPosition: (success: Function) => {
                success({ coords: { latitude: 31, longitude: 34 } });
            }
        };
        mockFetchReverse.mockResolvedValue({
            lat: 31, lon: 34, id: '123',
            name: "Tel Aviv",
            country: "Israel"
        });
        mockFetchWeather.mockResolvedValue({
            currentEn: {
                lat: 31,
                lon: 34,
                current: {
                    codeId: 1,
                    temp: 30,
                    feelsLike: 31,
                    desc: "Sunny",
                    icon: "01d",
                    humidity: 20,
                    wind: 5,
                    windDeg: 200,
                    pressure: 1000,
                    visibility: 10,
                    clouds: 0,
                    sunrise: 1719872400,
                    sunset: 1719924000,
                    timezone: 180
                },
                forecast: [],
                lastUpdated: Date.now(),
                unit: 'metric',
                isCurrentLocation: true
            },
            currentHe: {
                lat: 31,
                lon: 34,
                current: {
                    codeId: 1,
                    temp: 30,
                    feelsLike: 31,
                    desc: "שמשי",
                    icon: "01d",
                    humidity: 20,
                    wind: 5,
                    windDeg: 200,
                    pressure: 1000,
                    visibility: 10,
                    clouds: 0,
                    sunrise: 1719872400,
                    sunset: 1719924000,
                    timezone: 180
                },
                forecast: [],
                lastUpdated: Date.now(),
                unit: 'metric',
                isCurrentLocation: true
            },
            name: { en: "Tel Aviv", he: "תל אביב" },
            country: { en: "Israel", he: "ישראל" },
            id: "123",
            lat: 31,
            lon: 34,
            lastUpdated: Date.now(),
            isCurrentLocation: true
        });

        render(<AddLocation size="icon" type="icon" />);
        await screen.getByTestId('add-location').click();

        await waitFor(() => {
            expect(mockStore.addOrReplaceCurrentLocation).toHaveBeenCalled();
            expect(mockStore.showToast).toHaveBeenCalledWith(expect.objectContaining({
                message: 'toasts.locationAdded',
                type: 'success',
                values: { name: "Tel Aviv" }
            }));
        });
    });

    it('shows error toast when fetchReverse fails', async () => {
        (global.navigator as any).geolocation = {
            getCurrentPosition: (success: Function) => {
                success({ coords: { latitude: 31, longitude: 34 } });
            }
        };

        mockFetchReverse.mockRejectedValue(new Error('fail'));

        render(<AddLocation size="icon" type="icon" />);
        await screen.getByTestId('add-location').click();

        await waitFor(() => {
            expect(mockStore.showToast).toHaveBeenCalledWith({
                message: 'errors.fetchLocationWeather',
                type: 'error'
            });
        });
    });

    it('shows error toast when fetchWeather fails', async () => {
        (global.navigator as any).geolocation = {
            getCurrentPosition: (success: Function) => {
                success({ coords: { latitude: 31, longitude: 34 } });
            }
        };

        mockFetchReverse.mockResolvedValue({
            lat: 31, lon: 34, id: '123',
            name: "Tel Aviv",
            country: "Israel"
        });
        mockFetchWeather.mockRejectedValue(new Error('fail'));

        render(<AddLocation size="icon" type="icon" />);
        await screen.getByTestId('add-location').click();

        await waitFor(() => {
            expect(mockStore.showToast).toHaveBeenCalledWith({
                message: 'errors.fetchLocationWeather',
                type: 'error'
            });
        });
    });

    it('calls setIsLoading true when starting fetch', async () => {
        (global.navigator as any).geolocation = {
            getCurrentPosition: (success: Function) => {
                success({ coords: { latitude: 31, longitude: 34 } });
            }
        };

        mockFetchReverse.mockResolvedValue({
            lat: 31, lon: 34, id: '123',
            name: "Tel Aviv",
            country: "Israel"
        });
        mockFetchWeather.mockResolvedValue({
            currentEn: {
                lat: 31,
                lon: 34,
                current: {
                    codeId: 1,
                    temp: 30,
                    feelsLike: 31,
                    desc: "Sunny",
                    icon: "01d",
                    humidity: 20,
                    wind: 5,
                    windDeg: 200,
                    pressure: 1000,
                    visibility: 10,
                    clouds: 0,
                    sunrise: 1719872400,
                    sunset: 1719924000,
                    timezone: 180
                },
                forecast: [],
                lastUpdated: Date.now(),
                unit: 'metric',
                isCurrentLocation: true
            },
            currentHe: {
                lat: 31,
                lon: 34,
                current: {
                    codeId: 1,
                    temp: 30,
                    feelsLike: 31,
                    desc: "שמשי",
                    icon: "01d",
                    humidity: 20,
                    wind: 5,
                    windDeg: 200,
                    pressure: 1000,
                    visibility: 10,
                    clouds: 0,
                    sunrise: 1719872400,
                    sunset: 1719924000,
                    timezone: 180
                },
                forecast: [],
                lastUpdated: Date.now(),
                unit: 'metric',
                isCurrentLocation: true
            },
            name: { en: "Tel Aviv", he: "תל אביב" },
            country: { en: "Israel", he: "ישראל" },
            id: "123",
            lat: 31,
            lon: 34,
            lastUpdated: Date.now(),
            isCurrentLocation: true
        });

        render(<AddLocation size="icon" type="icon" />);
        await screen.getByTestId('add-location').click();

        // אמור להיקרא מיד בתחילת תהליך
        expect(mockStore.setIsLoading).toHaveBeenCalledWith(true);

        // בסוף כל התהליך
        await waitFor(() => {
            expect(mockStore.setIsLoading).toHaveBeenCalledWith(false);
        });
    });
})