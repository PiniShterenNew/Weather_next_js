import { render, screen, fireEvent, waitFor } from '@/test/utils/renderWithIntl'
import { vi } from 'vitest'
import { cityWeather } from '@/test/fixtures/cityWeather'

beforeEach(() => {
  vi.doMock('@/stores/useWeatherStore', () => {
    const state = {
      cities: [cityWeather],
      currentIndex: 0,
      autoLocationCityId: cityWeather.id,
      unit: 'metric',
      getUserTimezoneOffset: () => 10800,
      removeCity: vi.fn(),
      showToast: vi.fn(),
      refreshCity: vi.fn(),
      updateCity: vi.fn(),
    }
    return { useWeatherStore: (sel: any) => sel(state) }
  })

  vi.doMock('@/features/weather', () => ({
    fetchWeather: vi.fn(async () => cityWeather),
  }))

  vi.doMock('@/components/ForecastList/ForecastList.lazy', () => ({
    __esModule: true,
    default: () => <div data-testid="forecast-list" />,
  }))

  vi.doMock('@/lib/helpers', async () => {
    const a = await vi.importActual<typeof import('@/lib/helpers')>('@/lib/helpers')
    return {
      ...a,
      isSameTimezone: () => false,
      formatTimeWithOffset: (t: number) => new Date(t * 1000).toISOString().slice(11, 16),
      formatTemperatureWithConversion: (v: number) => `${v}°`,
      formatPressure: (v: number) => `${v} hPa`,
      formatWindSpeed: (v: number) => `${v} km/h`,
      formatVisibility: (v: number) => `${v} m`,
      getWindDirection: () => 'E',
    }
  })

  vi.doMock('@/components/WeatherIcon/WeatherIcon', () => ({
    WeatherIcon: () => <div data-testid="weather-icon" />,
  }))

  vi.doMock('@/components/WeatherCard/WeatherTimeNow', () => ({
    __esModule: true,
    default: () => <div data-testid="weather-time-now" />,
  }))
})

afterEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
})

describe('CityInfo', () => {
  it('renders header and at least one icon', async () => {
    const { default: CityInfo } = await import('./CityInfo')
    render(<CityInfo />)

    expect(await screen.findByText(/United States/i)).toBeInTheDocument()
    expect(await screen.findByText(/New York/i)).toBeInTheDocument()
    expect(screen.getAllByTestId('weather-icon').length).toBeGreaterThan(0)
  })

  it('renders WeatherTimeNow component', async () => {
    const { default: CityInfo } = await import('./CityInfo')
    render(<CityInfo />)
    expect(screen.getByTestId('weather-time-now')).toBeInTheDocument()
  })

  it('invokes removeCity on click', async () => {
    const { default: CityInfo } = await import('./CityInfo')
    const { useWeatherStore } = await import('@/stores/useWeatherStore')
    const state = useWeatherStore((s: any) => s)

    render(<CityInfo />)
    fireEvent.click(screen.getByRole('button', { name: /remove/i }))
    expect(state.removeCity).toHaveBeenCalledWith(cityWeather.id)
  })

  it('displays main weather metrics', async () => {
    const humidity = `${cityWeather.currentEn.current.humidity}%`
    const wind = /km\/h E/
    const pressure = new RegExp(`${cityWeather.currentEn.current.pressure} hPa`)
    const visibility = new RegExp(`${cityWeather.currentEn.current.visibility} m`)

    const { default: CityInfo } = await import('./CityInfo')
    render(<CityInfo />)

    await waitFor(() => {
      expect(screen.getByText(humidity)).toBeInTheDocument()
      expect(screen.getByText(wind)).toBeInTheDocument()
      expect(screen.getByText(pressure)).toBeInTheDocument()
      expect(screen.getByText(visibility)).toBeInTheDocument()
    })
  })

  it('renders ForecastList placeholder', async () => {
    const { default: CityInfo } = await import('./CityInfo')
    render(<CityInfo />)
    expect(await screen.findByTestId('forecast-list')).toBeInTheDocument()
  })
})
