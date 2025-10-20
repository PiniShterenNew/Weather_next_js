import { render, screen } from '@/tests/utils/renderWithIntl'
import { act } from 'react'
import { vi } from 'vitest'

function mockWeatherStore(offset: number) {
    vi.doMock('@/store/useWeatherStore', () => {
        const store = {
            getUserTimezoneOffset: () => offset,
        }
        return {
            useWeatherStore: (selector: any) => selector(store),
            getState: () => store,
        }
    })
}

vi.useFakeTimers().setSystemTime(new Date('2025-06-24T12:00:00Z'))

vi.mock('@/lib/helpers', async (original) => {
    const actual = await vi.importActual<typeof import('@/lib/helpers')>('@/lib/helpers')
    return {
        ...actual,
        isSameTimezone: (tz: number, userTz: number) => tz === userTz,
        formatTimeWithOffset: (time: number, offset: number) => {
            const date = new Date((time + offset) * 1000)
            return date.toISOString().slice(11, 16)
        },
    }
})

async function getWeatherTimeNow() {
    return (await import('@/features/weather/components/WeatherTimeNow')).default
}

afterEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
})

describe('WeatherTimeNow', () => {
    it('renders only user time and date when timezones are equal', async () => {
        mockWeatherStore(7200)
        const WeatherTimeNow = await getWeatherTimeNow()
        const { unmount } = render(<WeatherTimeNow timezone={7200} />)
        const userTime = screen.getByTestId('user-time')
        expect(userTime).toBeInTheDocument()
        expect(userTime.textContent).toMatch(/Tuesday.*June 24/)
        expect(screen.queryByTestId('city-time')).not.toBeInTheDocument()
        unmount()
    })

    it('renders city and user time when timezones differ', async () => {
        mockWeatherStore(7200)
        const WeatherTimeNow = await getWeatherTimeNow()
        const { unmount } = render(<WeatherTimeNow timezone={0} />)
        const userTime = screen.getByTestId('user-time')
        const cityTime = screen.getByTestId('city-time')
        expect(userTime).toBeInTheDocument()
        expect(cityTime).toBeInTheDocument()
        expect(userTime.textContent).toMatch(/Tuesday.*June 24/)
        expect(cityTime.textContent).toMatch(/Tuesday.*June 24/)
        unmount()
    })

    it('blinking colon renders consistently over time', async () => {
        mockWeatherStore(7200)
        const WeatherTimeNow = await getWeatherTimeNow()
        render(<WeatherTimeNow timezone={0} />)
        const colonsBefore = screen.getAllByText(':').length
        await act(async () => {
            vi.advanceTimersByTime(1000)
        })
        const colonsAfter = screen.getAllByText(':').length
        expect(colonsAfter).toBe(colonsBefore)
    })

})
