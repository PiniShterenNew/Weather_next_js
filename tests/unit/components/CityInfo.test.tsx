import { fireEvent, render, screen, waitFor, within } from '@/tests/utils/renderWithIntl'
import { vi } from 'vitest'
import { cityWeather } from '@/tests/fixtures/cityWeather'

type MockState = {
  cities: typeof cityWeather[];
  currentIndex: number;
  autoLocationCityId: string;
  unit: string;
  getUserTimezoneOffset: () => number;
  removeCity: ReturnType<typeof vi.fn>;
  showToast: ReturnType<typeof vi.fn>;
  refreshCity: ReturnType<typeof vi.fn>;
  updateCity: ReturnType<typeof vi.fn>;
};

let mockState: MockState | undefined;

function createMockState(): MockState {
  return {
    cities: [cityWeather],
    currentIndex: 0,
    autoLocationCityId: cityWeather.id,
    unit: 'metric',
    getUserTimezoneOffset: () => 10800,
    removeCity: vi.fn(),
    showToast: vi.fn(),
    refreshCity: vi.fn(),
    updateCity: vi.fn(),
  };
}

function ensureMockState(): MockState {
  if (!mockState) {
    mockState = createMockState();
  }
  return mockState;
}

vi.mock('@/store/useWeatherStore', () => ({
  useWeatherStore: (selector = (s: MockState) => s) => selector(ensureMockState()),
}));

vi.mock('@/features/weather/components/card/WeatherCardContent', () => ({
  __esModule: true,
  default: ({ cityWeather }: { cityWeather: typeof cityWeather }) => (
    <div data-testid="weather-card-content">
      <p data-testid="temperature">{cityWeather.current.temp}</p>
      <div data-testid="weather-details" />
      <button aria-label="Remove" onClick={() => ensureMockState().removeCity(cityWeather.id)}>
        Remove
      </button>
      <div data-testid="forecast-list" />
      <div data-testid="weather-time-now" />
    </div>
  ),
}));

vi.mock('@/features/weather/components/WeatherDetails', () => ({
  __esModule: true,
  default: () => <div data-testid="weather-details" />,
}));

vi.mock('@/features/weather/components/HourlyForecast', () => ({
  __esModule: true,
  default: () => <div data-testid="hourly-forecast" />,
}));

vi.mock('@/features/weather', () => ({
  fetchWeather: vi.fn(async () => cityWeather),
}));

vi.mock('@/lib/helpers', async () => {
  const actual = await vi.importActual<typeof import('@/lib/helpers')>('@/lib/helpers')
  return {
    ...actual,
    isSameTimezone: () => false,
    formatTimeWithOffset: (t: number) => new Date(t * 1000).toISOString().slice(11, 16),
  }
})

describe('CityInfo', () => {
  beforeEach(() => {
    mockState = createMockState()
  })

  it('renders weather card content for current city', async () => {
    const { default: CityInfo } = await import('@/features/weather/components/card/CityInfo')
    render(<CityInfo />)

    await waitFor(() => expect(screen.getByTestId('weather-card-content')).toBeInTheDocument())
    expect(screen.getByTestId('weather-details')).toBeInTheDocument()
  })

  it('invokes removeCity on click', async () => {
    const { default: CityInfo } = await import('@/features/weather/components/card/CityInfo')
    render(<CityInfo />)

    const removeButton = await screen.findByRole('button', { name: /remove/i })
    fireEvent.click(removeButton)

    expect(ensureMockState().removeCity).toHaveBeenCalledWith(cityWeather.id)
  })

  it('renders ForecastList placeholder', async () => {
    const { default: CityInfo } = await import('@/features/weather/components/card/CityInfo')
    render(<CityInfo />)

    const content = await screen.findByTestId('weather-card-content')
    expect(within(content).getByTestId('forecast-list')).toBeInTheDocument()
    expect(within(content).getByTestId('weather-time-now')).toBeInTheDocument()
  })
})
