import { render, screen, fireEvent, within } from '@/tests/utils/renderWithIntl'
import { vi } from 'vitest'
import WeatherListItem from '@/components/CitiesList/WeatherListItem'
import { cityWeather } from '@/tests/fixtures/cityWeather'

vi.mock('next-intl', async importOriginal => {
  const actual = await importOriginal<typeof import('next-intl')>()
  return {
    ...actual,
    useLocale: () => 'en',
    useTranslations: () => (k: string) => k,
  }
})

vi.mock('@/lib/helpers', async () => {
  const actual = await vi.importActual<typeof import('@/lib/helpers')>('@/lib/helpers')
  return {
    ...actual,
    formatTemperatureWithConversion: (v: number) => `${v}°`,
    formatWindSpeed: (v: number) => `${v} km/h`,
    formatVisibility: () => '10 km',
    getWindDirection: () => 'E',
  }
})

vi.mock('@/components/WeatherIcon/WeatherIcon', () => ({
  WeatherIcon: ({ icon }: { icon?: string }) => (
    <div data-testid={icon ? 'location-icon' : 'icon'} />
  ),
}))

const state = {
  unit: 'metric',
  autoLocationCityId: cityWeather.id,
}
vi.mock('@/store/useWeatherStore', () => ({
  useWeatherStore: (sel: any) => sel(state),
}))

const renderItem = () =>
  render(
    <WeatherListItem
      ref={() => {}}
      city={cityWeather}
      cityCurrent={cityWeather.currentEn}
      isCurrentIndex={false}
    />,
  )

describe('WeatherListItem', () => {
  it('shows name, country and temperature', () => {
    renderItem()
    expect(screen.getByText(/New York/i)).toBeInTheDocument()
    expect(screen.getByText(/United States/i)).toBeInTheDocument()
     expect(screen.getByText('20')).toBeInTheDocument()
  })

  it('renders location icon when city is current location', () => {
    renderItem()
    expect(screen.getByTestId('location-icon')).toBeInTheDocument()
  })

  it('calls onClick handler', () => {
    const handleClick = vi.fn()
    render(
      <WeatherListItem
        ref={() => {}}
        city={cityWeather}
        cityCurrent={cityWeather.currentEn}
        isCurrentIndex={false}
        onClick={handleClick}
      />,
    )
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })

  it('displays humidity, wind and visibility metrics', () => {
    renderItem()
    const root = screen.getByRole('button')
    expect(within(root).getByText(/60%/)).toBeInTheDocument()
     expect(within(root).getByText('3.5')).toBeInTheDocument()
     expect(within(root).getByText('10')).toBeInTheDocument()
  })
})
