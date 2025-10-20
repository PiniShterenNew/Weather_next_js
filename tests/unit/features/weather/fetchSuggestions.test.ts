// features/weather/fetchSuggestions.test.ts
import { fetchSuggestions } from '@/features/weather/fetchSuggestions'
import { vi } from 'vitest'

describe('fetchSuggestions (using fetch)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const mockSuggestions = ['Tel Aviv', 'Tiberias']

  it('calls fetch with correct query string, lang param and options, then returns data', async () => {
    ;(fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockSuggestions,
    })

    const result = await fetchSuggestions('tel')

    expect(fetch).toHaveBeenCalledWith(
      '/api/suggest?q=tel&lang=he',
      { next: { revalidate: 300 } },
    )
    expect(result).toEqual(mockSuggestions)
  })

  it('returns [] if fetch response is not ok', async () => {
    ;(fetch as any).mockResolvedValue({ ok: false })

    const result = await fetchSuggestions('x')

    expect(result).toEqual([])
  })

  it('returns [] if fetch itself fails', async () => {
    ;(fetch as any).mockRejectedValue(new Error('network fail'))

    const result = await fetchSuggestions('anything')

    expect(result).toEqual([])
  })
})
