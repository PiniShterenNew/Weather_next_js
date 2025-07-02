import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils/renderWithIntl';
import WeatherCarousel from './Weatherlist';
import { CityWeather } from '@/types/weather';

vi.mock('@/hooks/useIsClient', () => ({
  __esModule: true,
  default: () => true,
}));

let mockWeatherState: any;

vi.mock('@/stores/useWeatherStore', () => ({
  useWeatherStore: (selector: any) => selector(mockWeatherState),
}));

vi.mock('@/components/WeatherCarousel/DotsIndicator', () => ({
  __esModule: true,
  default: ({ length, currentIndex }: { length: number; currentIndex: number }) => (
    <div data-testid="dots-indicator">
      {Array.from({ length }).map((_, i) => (
        <span key={i} data-testid="dot">
          {i === currentIndex ? 'active' : 'dot'}
        </span>
      ))}
    </div>
  ),
}));

const mockShowToast = vi.fn();
const mockRefreshCity = vi.fn();
const mockRemoveCity = vi.fn();
const mockUpdateCity = vi.fn();
const mockSetCurrentIndex = vi.fn();
const mockPrevCity = vi.fn();
const mockNextCity = vi.fn();
const mockGetUserTimezoneOffset = vi.fn(() => 0);

const mockCities: CityWeather[] = [
  {
    id: '1',
    name: 'Berlin',
    country: 'DE',
    lat: 0,
    lon: 0,
    unit: 'metric',
    lang: 'en',
    current: {
      temp: 22,
      feelsLike: 22,
      desc: 'Clear',
      icon: '01d',
      humidity: 50,
      pressure: 1012,
      visibility: 10000,
      windDeg: 100,
      wind: 3,
      clouds: 0,
      sunrise: 0,
      sunset: 0,
      timezone: 0,
    },
    forecast: [],
    lastUpdated: Date.now() / 1000,
  },
  {
    id: '2',
    name: 'Moscow',
    country: 'RU',
    lat: 0,
    lon: 0,
    unit: 'metric',
    lang: 'en',
    current: {
      temp: 20,
      feelsLike: 19,
      desc: 'Cloudy',
      icon: '02d',
      humidity: 60,
      pressure: 1010,
      visibility: 8000,
      windDeg: 90,
      wind: 4,
      clouds: 20,
      sunrise: 0,
      sunset: 0,
      timezone: 0,
    },
    forecast: [],
    lastUpdated: Date.now() / 1000,
  },
];

describe('WeatherCarousel – Unit + Integration', () => {
  beforeAll(() => {
    window.HTMLElement.prototype.scrollTo = function () { };
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockWeatherState = {
      cities: mockCities,
      currentIndex: 0,
      setCurrentIndex: mockSetCurrentIndex,
      prevCity: mockPrevCity,
      nextCity: mockNextCity,
      showToast: mockShowToast,
      getUserTimezoneOffset: mockGetUserTimezoneOffset,
      refreshCity: mockRefreshCity,
      removeCity: mockRemoveCity,
      updateCity: mockUpdateCity,
      unit: 'metric',
      locale: 'en',
      isLoading: false,
    };
  });

  afterEach(() => {
    document.documentElement.dir = 'ltr'; // להחזיר למצב רגיל
  });

  it('renders city names and countries', () => {
    render(<WeatherCarousel />);
    expect(screen.getByText('Berlin')).toBeInTheDocument();
    expect(screen.getByText('DE')).toBeInTheDocument();
  });

  it('clicking next button calls nextCity', () => {
    render(<WeatherCarousel />);
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(mockNextCity).toHaveBeenCalled();
  });

  it('clicking prev button calls prevCity', () => {
    render(<WeatherCarousel />);
    fireEvent.click(screen.getByRole('button', { name: /prev/i }));
    expect(mockPrevCity).toHaveBeenCalled();
  });

  it('shows DotsIndicator with correct number of dots', () => {
    render(<WeatherCarousel />);
    const dots = screen.getAllByTestId('dot');
    expect(dots).toHaveLength(mockCities.length);
  });

  it('navigates cities using arrow keys', () => {
    render(<WeatherCarousel />);
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(mockPrevCity).toHaveBeenCalled();
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(mockNextCity).toHaveBeenCalled();
  });

  it('shows correct direction based on locale', () => {
    render(<WeatherCarousel />);
    const label = screen.getAllByRole('button')[0].getAttribute('aria-label');
    expect(typeof label).toBe('string');
    expect(label).toMatch(/next|prev/i);
  });

  it('scrolls to top when current city changes', async () => {
    const scrollTo = vi.fn();
    window.HTMLElement.prototype.scrollTo = scrollTo;
    mockWeatherState.cities[0].id = 'new-id'; // simulate change
    render(<WeatherCarousel />);
    render(<WeatherCarousel />);
    await waitFor(() => {
      expect(scrollTo).toHaveBeenCalled();
    });
  });

  it('does not render if not isClient', async () => {
    vi.resetModules();
    vi.doMock('@/hooks/useIsClient', () => ({
      __esModule: true,
      default: () => false,
    }));
    const { default: WeatherCarousel } = await import('./Weatherlist');
    render(<WeatherCarousel />);
    expect(screen.queryByTestId('weather-carousel')).toBeNull();
  });

  it('shows WeatherEmpty if no current city', () => {
    mockWeatherState.cities = [];
    render(<WeatherCarousel />);
    expect(screen.getByText(/no cities added/i)).toBeInTheDocument();
  });

  it('renders LTR controls correctly in English', () => {
    render(<WeatherCarousel />, { locale: 'en' });
    expect(document.documentElement.dir).toBe('ltr');
    // כפתור NEXT ב-LTR מפעיל actually את previous!
    const nextButton = screen.getByTestId('next-button');
    const prevButton = screen.getByTestId('prev-button');
    expect(nextButton).toBeInTheDocument();
    expect(prevButton).toBeInTheDocument();
    fireEvent.click(nextButton);
    expect(mockPrevCity).toHaveBeenCalled();  // שים לב! לא mockNextCity
    fireEvent.click(prevButton);
    expect(mockNextCity).toHaveBeenCalled();
  });
  
  it('renders RTL controls correctly in Hebrew', () => {
    render(<WeatherCarousel />, { locale: 'he' });
    expect(document.documentElement.dir).toBe('rtl');
    const nextButton = screen.getByTestId('next-button');
    const prevButton = screen.getByTestId('prev-button');
    expect(nextButton).toBeInTheDocument();
    expect(prevButton).toBeInTheDocument();
    fireEvent.click(nextButton);
    expect(mockNextCity).toHaveBeenCalled(); // RTL: nextButton == Next
    fireEvent.click(prevButton);
    expect(mockPrevCity).toHaveBeenCalled(); // RTL: prevButton == Prev
  });
});
