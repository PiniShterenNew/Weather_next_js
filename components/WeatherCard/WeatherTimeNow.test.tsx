import { render, screen } from '@/test/utils/renderWithIntl'
import { act } from 'react'
import { vi } from 'vitest'

function mockWeatherStore(offset: number) {
    vi.doMock('@/stores/useWeatherStore', () => {
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
    return (await import('./WeatherTimeNow')).default
}

afterEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
})

describe('WeatherTimeNow', () => {
    it('renders only city time and date when timezones are equal', async () => {
        mockWeatherStore(7200)
        const WeatherTimeNow = await getWeatherTimeNow()
        const { unmount } = render(<WeatherTimeNow timezone={7200} />)
        const cityTime = screen.getByTestId('city-time')
        expect(cityTime).toBeInTheDocument()
        expect(cityTime.textContent).toMatch(/Tuesday.*June 24/)
        expect(screen.queryByText(/\(\d{2}:\d{2}\)/)).not.toBeInTheDocument()
        unmount()
    })

    it('renders city and user time when timezones differ', async () => {
        mockWeatherStore(7200)
        const WeatherTimeNow = await getWeatherTimeNow()
        const { unmount } = render(<WeatherTimeNow timezone={0} />)
        const cityTime = screen.getByTestId('city-time')
        expect(cityTime).toBeInTheDocument()
        expect(cityTime.textContent).toMatch(/Tuesday.*June 24/)
        const userTime = screen.getByText((text, el) =>
            el?.tagName === 'SPAN' && /\d{2}\)/.test(text)
        )
        expect(userTime).toBeInTheDocument()
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
