import { render, screen, fireEvent, waitFor } from '@/test/utils/renderWithIntl';
import WeatherCard from './WeatherCard';
import type { CityWeather } from '@/types/weather';

const defaultProps = {
    city: {
        id: 'tlv_IL',
        name: 'Tel Aviv',
        country: 'Israel',
        lat: 32.0853,
        lon: 34.7818,
        lang: 'en',
        current: {
            temp: 30,
            feelsLike: 33,
            desc: 'Sunny',
            icon: '01d',
            humidity: 40,
            wind: 12,
            windDeg: 180,
            pressure: 1012,
            visibility: 10000,
            clouds: 0,
            sunrise: 1719103200,
            sunset: 1719150000,
            timezone: 10800,
        },
        forecast: [],
        lastUpdated: Date.now() - 4 * 60 * 60 * 1000, // 4 hours ago (to trigger auto refresh)
        unit: 'metric',
    },
    index: 0,
    isActive: true,
    onClick: vi.fn(),
    onRemove: vi.fn(),
    direction: 'ltr',
    isAutoLocation: false,
};

const mockRemoveCity = vi.fn();
const mockUpdateCity = vi.fn();
const mockRefreshCity = vi.fn();
const mockShowToast = vi.fn();
const mockFetchReverse = vi.fn();

const mockStore = {
    removeCity: mockRemoveCity,
    unit: 'metric',
    updateCity: mockUpdateCity,
    refreshCity: mockRefreshCity,
    showToast: mockShowToast,
    getUserTimezoneOffset: () => 10800,
    locale: 'en',
};

vi.mock('@/features/weather/fetchReverse', () => ({
    fetchReverse: (...args: any[]) => mockFetchReverse(...args),
}));

vi.mock('@/stores/useWeatherStore', () => {
    return {
        useWeatherStore: Object.assign(
            (selector: any) => selector(mockStore),
            {
                getState: () => mockStore,
            }
        ),
    };
});

vi.mock('@/features/weather', () => ({
    fetchWeather: vi.fn(async () => ({
        ...defaultProps.city,
        current: { ...defaultProps.city.current, temp: 31 },
    })),
}));

beforeEach(() => {
    vi.resetAllMocks();
    mockFetchReverse.mockReset();
    mockFetchReverse.mockResolvedValue({ name: 'תל אביב', country: 'ישראל' });
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('WeatherCard', () => {
    it('renders city name and country', () => {
        render(<WeatherCard city={defaultProps.city as CityWeather} />);
        expect(screen.getByText('Tel Aviv')).toBeInTheDocument();
        expect(screen.getByText('Israel')).toBeInTheDocument();
    });

    it("renders current temperature and 'feels like'", () => {
        render(<WeatherCard city={defaultProps.city as CityWeather} />);
        expect(screen.getByText(/30.*°C/i)).toBeInTheDocument();
        expect(screen.getByText(/feels like 33.*°C/i)).toBeInTheDocument();
    });

    it('renders weather description', () => {
        render(<WeatherCard city={defaultProps.city as CityWeather} />);
        expect(screen.getByText('Sunny')).toBeInTheDocument();
    });

    it('calls onRemove when delete button is clicked', () => {
        render(<WeatherCard city={defaultProps.city as CityWeather} />);
        const button = screen.getByRole('button', { name: /remove/i });
        fireEvent.click(button);
        expect(mockRemoveCity).toHaveBeenCalledWith(defaultProps.city.id);
    });

    it('renders the location icon if city is current location', () => {
        render(
            <WeatherCard city={{ ...defaultProps.city, isCurrentLocation: true } as CityWeather} />
        );
        expect(screen.getByTestId('location-icon')).toBeInTheDocument();
    });

    it('renders all weather details correctly', () => {
        render(<WeatherCard city={defaultProps.city as CityWeather} />);
        expect(screen.getByText(/40%/)).toBeInTheDocument(); // humidity
        expect(screen.getByText(/12.*S/i)).toBeInTheDocument(); // wind speed + direction
        expect(screen.getByText(/1012/)).toBeInTheDocument(); // pressure
        expect(screen.getByText(/10.*km/i)).toBeInTheDocument(); // visibility
        expect(screen.getByText('0%')).toBeInTheDocument(); // clouds
        expect(screen.getByText(/uv index/i)).toBeInTheDocument(); // UV index placeholder
    });

    it('renders sunrise and sunset times', () => {
        render(<WeatherCard city={defaultProps.city as CityWeather} />);
        expect(screen.getByText(/sunrise/i)).toBeInTheDocument();
        expect(screen.getByText(/sunset/i)).toBeInTheDocument();
    });

    it('renders city time and user time if timezones differ', () => {
        render(
            <WeatherCard
                city={{ ...defaultProps.city, current: { ...defaultProps.city.current, timezone: 7200 } } as CityWeather}
            />
        );
        expect(screen.getAllByText(/your time/i).length).toBeGreaterThanOrEqual(1);
    });

    it('calls fetchWeather and updates city on manual refresh', async () => {
        render(<WeatherCard city={defaultProps.city as CityWeather} />);
        const button = screen.getByRole('button', { name: /refresh/i });
        fireEvent.click(button);
        await waitFor(() => {
            expect(mockUpdateCity).toHaveBeenCalled();
            expect(mockShowToast).toHaveBeenCalledWith({
                message: 'toasts.refreshed',
            });
        });
    });

    it('calls refreshCity and shows error toast on refresh fail', async () => {
        const { fetchWeather } = await import('@/features/weather');
        (fetchWeather as any).mockRejectedValueOnce(new Error('API error'));

        render(<WeatherCard city={defaultProps.city as CityWeather} />);
        const button = screen.getByRole('button', { name: /refresh/i });
        fireEvent.click(button);

        await waitFor(() => {
            expect(mockRefreshCity).toHaveBeenCalledWith(defaultProps.city.id);
            expect(mockShowToast).toHaveBeenCalledWith({
                message: 'toasts.error',
            });
        });
    });

    it('triggers automatic refresh if data is stale', async () => {
        render(<WeatherCard city={defaultProps.city as CityWeather} />);
        await waitFor(() => {
            expect(mockUpdateCity).toHaveBeenCalled();
        });
    });

    it('does not trigger refresh if data is fresh and unit matches', async () => {
        const freshProps = {
            ...defaultProps,
            city: { ...defaultProps.city, lastUpdated: Date.now(), unit: 'metric' },
        };
        render(<WeatherCard city={freshProps.city as CityWeather} />);
        await waitFor(() => {
            expect(mockUpdateCity).not.toHaveBeenCalled();
        });
    });
    it('calls fetchReverse and updates city when locale differs from city.lang and fetchReverse succeeds', async () => {
        const { fetchWeather } = await import('@/features/weather');
        (fetchWeather as any).mockResolvedValue({
            ...defaultProps.city,
            current: { ...defaultProps.city.current, temp: 31 },
            name: 'תל אביב',
            country: 'ישראל',
            lang: 'he'
        });

        mockFetchReverse.mockResolvedValue({ name: 'תל אביב', country: 'ישראל' });
        mockStore.locale = 'he';
        render(<WeatherCard city={{ ...defaultProps.city, lang: 'en' } as CityWeather} />);
        fireEvent.click(screen.getByRole('button', { name: /refresh/i }));
        await waitFor(() => {
            expect(mockFetchReverse).toHaveBeenCalledWith(defaultProps.city.lat, defaultProps.city.lon, 'he');
            expect(mockUpdateCity).toHaveBeenCalledWith(
                expect.objectContaining({ name: 'תל אביב', country: 'ישראל' })
            );
            expect(mockShowToast).toHaveBeenCalledWith({ message: 'toasts.refreshed' });
        });
    });

    it('shows error toast and uses original name if fetchReverse fails', async () => {
        mockFetchReverse.mockRejectedValue(new Error('fail'));
        mockStore.locale = 'he';
        render(<WeatherCard city={{ ...defaultProps.city, lang: 'en' } as CityWeather} />);
        fireEvent.click(screen.getByRole('button', { name: /refresh/i }));
        await waitFor(() => {
            expect(mockFetchReverse).toHaveBeenCalledWith(defaultProps.city.lat, defaultProps.city.lon, 'he');
            expect(mockUpdateCity).toHaveBeenCalledWith(
                expect.objectContaining({ name: defaultProps.city.name, country: defaultProps.city.country })
            );
            expect(mockShowToast).toHaveBeenCalledWith({ message: 'toasts.error' });
        });
    });

});
