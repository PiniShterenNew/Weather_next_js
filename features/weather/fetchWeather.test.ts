// features/weather/fetchWeather.test.ts
import { fetchWeather } from '@/features/weather/fetchWeather'
import { vi } from 'vitest'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('fetchWeather', () => {
  const mockData = { id: '123', name: 'Tel Aviv', temp: 26 }

  it('calls fetch with correct query-string (lat, lon, unit, id) and returns the response JSON', async () => {
    ;(fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    })

    const result = await fetchWeather({
      id: '123',
      lat: 32.07,
      lon: 34.79,
      unit: 'metric',
    })

    expect(fetch).toHaveBeenCalledWith(
      '/api/weather?lat=32.07&lon=34.79&unit=metric&id=123',
      { next: { revalidate: 1800 } },
    )
    expect(result).toEqual(expect.objectContaining(mockData))
  })

  it('returns “Failed to fetch weather” when response.ok is false', async () => {
    ;(fetch as any).mockResolvedValue({ ok: false })

    await expect(
      fetchWeather({ id: '1', lat: 1, lon: 2, unit: 'imperial' }),
    ).rejects.toThrow('Failed to fetch weather')
  })

  it('returns “Failed to fetch weather data” when fetch itself rejects', async () => {
    ;(fetch as any).mockRejectedValue(new Error('network boom'))

    await expect(
      fetchWeather({ id: '1', lat: 1, lon: 2, unit: 'imperial' }),
    ).rejects.toThrow('Failed to fetch weather data')
  })
})
