import { render, screen, fireEvent } from '@/test/utils/renderWithIntl'
import { vi } from 'vitest'
import { AppLocale } from '@/types/i18n'
import WeatherList from '@/components/WeatherList/WeatherList'
import { act } from 'react'

vi.mock('next-intl', async importOriginal => {
  const actual = await importOriginal<typeof import('next-intl')>()
  return {
    ...actual,
    useLocale: () => 'en' as AppLocale,
    useTranslations: () => (k: string) => k,
  }
})

window.HTMLElement.prototype.scrollIntoView = vi.fn()
window.HTMLElement.prototype.focus = vi.fn()

const baseCity = {
  id: '1',
  lat: 0,
  lon: 0,
  unit: 'metric',
  name: { en: 'London', he: 'לונדון' },
  country: { en: 'UK', he: 'בריטניה' },
  currentEn: {
    current: {
      temp: 15,
      feelsLike: 14,
      humidity: 60,
      wind: 5,
      windDeg: 90,
      visibility: 10_000,
      pressure: 1012,
      clouds: 10,
      icon: '01d',
      desc: 'Clear',
      codeId: '01d',
      timezone: 0,
      sunrise: 0,
      sunset: 0,
    },
    unit: 'metric',
  },
  currentHe: {} as any,
  forecastEn: [],
  forecastHe: [],
  lastUpdated: 0,
}
const secondCity = {
  ...baseCity,
  id: '2',
  name: { en: 'Paris', he: 'פריז' },
  country: { en: 'France', he: 'צרפת' },
}

const storeState = {
  cities: [baseCity, secondCity],
  currentIndex: 0,
  unit: 'metric',
  autoLocationCityId: '1',
  setCurrentIndex: vi.fn((i: number) => (storeState.currentIndex = i)),
  nextCity: vi.fn(() => {
    storeState.currentIndex = (storeState.currentIndex + 1) % storeState.cities.length
  }),
  prevCity: vi.fn(() => {
    storeState.currentIndex =
      (storeState.currentIndex - 1 + storeState.cities.length) % storeState.cities.length
  }),
}

vi.mock('@/stores/useWeatherStore', () => ({
  useWeatherStore: (sel: any) => sel(storeState),
}))

vi.mock('@/lib/helpers', async orig => {
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
  WeatherIcon: () => <div data-testid="icon" />,
}))

describe('WeatherList & WeatherListItem', () => {
  it('renders all cities with basic info', async () => {
    await act(async () => {
      render(<WeatherList />)
    })

    expect(screen.getByText(/London/i)).toBeInTheDocument()
    expect(screen.getByText(/UK/i)).toBeInTheDocument()
    expect(screen.getByText(/Paris/i)).toBeInTheDocument()
    expect(screen.getByText(/France/i)).toBeInTheDocument()
    expect(screen.getAllByText(/15°/)).toHaveLength(2)
  })

  it('changes current index on click', async () => {
    await act(async () => {
      render(<WeatherList />)
    })

    await act(async () => {
      fireEvent.click(screen.getByText(/Paris/i))
    })

    expect(storeState.setCurrentIndex).toHaveBeenCalledWith(1)
  })

  it('navigates with arrow keys', async () => {
    await act(async () => {
      render(<WeatherList />)
    })

    await act(async () => {
      fireEvent.keyDown(window, { key: 'ArrowDown' })
    })
    expect(storeState.nextCity).toHaveBeenCalled()

    await act(async () => {
      fireEvent.keyDown(window, { key: 'ArrowUp' })
    })
    expect(storeState.prevCity).toHaveBeenCalled()
  })

  it('shows humidity, wind and visibility metrics for every city', async () => {
    await act(async () => {
      render(<WeatherList />)
    })

    expect(screen.getAllByText(/60%/)).toHaveLength(2)
    expect(screen.getAllByText(/5 km\/h E/)).toHaveLength(2)
    expect(screen.getAllByText(/10 km/)).toHaveLength(2)
  })
})
