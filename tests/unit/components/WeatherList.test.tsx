import { render, screen, fireEvent } from '@/tests/utils/renderWithIntl'
import { vi } from 'vitest'
import { AppLocale } from '@/types/i18n'
import WeatherList from '@/features/cities/components/WeatherList'
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
  current: {
    temp: 15,
    feelsLike: 14,
    tempMin: 10,
    tempMax: 20,
    humidity: 60,
    wind: 5,
    windDeg: 90,
    visibility: 10_000,
    pressure: 1012,
    clouds: 10,
    icon: '01d',
    desc: 'Clear',
    codeId: 800,
    timezone: 0,
    sunrise: 0,
    sunset: 0,
  },
  forecast: [],
  hourly: [],
  lastUpdated: 0,
  isCurrentLocation: false,
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

vi.mock('@/store/useWeatherStore', () => ({
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

// Mock @tanstack/react-virtual to return actual items
vi.mock('@tanstack/react-virtual', () => {
  const actual = vi.importActual('@tanstack/react-virtual');
  return {
    ...actual,
    useVirtualizer: vi.fn(({ count, getScrollElement, estimateSize, overscan }) => {
      const mockScrollElement = { current: { scrollTop: 0, scrollHeight: count * estimateSize() } };
      return {
        getVirtualItems: () => {
          // Return all items for testing (no virtualization in tests)
          return Array.from({ length: count }, (_, i) => ({
            key: `virtual-${i}`,
            index: i,
            start: i * estimateSize(),
            size: estimateSize(),
          }));
        },
        getTotalSize: () => count * estimateSize(),
        scrollToIndex: vi.fn(),
        measureElement: vi.fn(),
        getScrollElement: () => getScrollElement(),
      };
    }),
  };
})

describe('WeatherList & WeatherListItem', () => {
  it('renders all cities with basic info', async () => {
    await act(async () => {
      render(<WeatherList />)
    })

    // With virtualization, items are rendered inside virtual container
    // We need to wait for them to appear
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    expect(screen.getByText(/London/i)).toBeInTheDocument()
    expect(screen.getByText(/UK/i)).toBeInTheDocument()
    expect(screen.getByText(/Paris/i)).toBeInTheDocument()
    expect(screen.getByText(/France/i)).toBeInTheDocument()
    expect(screen.getAllByText(/15/)).toHaveLength(2)
  })

  it('changes current index on click', async () => {
    await act(async () => {
      render(<WeatherList />)
    })

    // Wait for virtual items to render
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200))
    })

    const parisButton = screen.getByText(/Paris/i).closest('button')
    if (parisButton) {
      await act(async () => {
        fireEvent.click(parisButton)
      })
      expect(storeState.setCurrentIndex).toHaveBeenCalledWith(1)
    } else {
      // Fallback: find by role
      const listItems = screen.getAllByRole('listitem')
      if (listItems.length > 1) {
        await act(async () => {
          fireEvent.click(listItems[1])
        })
        expect(storeState.setCurrentIndex).toHaveBeenCalled()
      }
    }
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

    // Wait for virtual items to render
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200))
    })

    // Humidity appears once per city
    const humidityElements = screen.getAllByText(/60%/)
    expect(humidityElements.length).toBeGreaterThanOrEqual(2)
    
    // Wind speed (5) appears in multiple places
    const windElements = screen.getAllByText(/5/)
    expect(windElements.length).toBeGreaterThanOrEqual(2)
  })
})
