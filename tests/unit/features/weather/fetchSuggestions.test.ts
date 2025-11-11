// features/weather/fetchSuggestions.test.ts
import { vi } from 'vitest'

describe('fetchSuggestions (using fetchSecure)', () => {
  const mockFetchSecure = vi.fn()
  const mockSuggestions = ['Tel Aviv', 'Tiberias']

  beforeEach(() => {
    vi.resetModules()
    vi.doMock('@/lib/fetchSecure', () => ({
      fetchSecure: mockFetchSecure,
    }))
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('calls fetchSecure with correct parameters and returns suggestions', async () => {
    mockFetchSecure.mockResolvedValue({
      ok: true,
      json: async () => mockSuggestions,
    })

    const { fetchSuggestions } = await import('@/features/weather/fetchSuggestions')
    const result = await fetchSuggestions('tel')

    expect(mockFetchSecure).toHaveBeenCalledWith(
      '/api/suggest?q=tel&lang=he',
      expect.objectContaining({
        requireAuth: true,
        next: { revalidate: 300 },
      }),
    )
    expect(result).toEqual(mockSuggestions)
  })

  it('returns [] if response is not ok', async () => {
    mockFetchSecure.mockResolvedValue({ ok: false })

    const { fetchSuggestions } = await import('@/features/weather/fetchSuggestions')
    const result = await fetchSuggestions('x')

    expect(result).toEqual([])
  })

  it('returns [] if fetchSecure fails', async () => {
    mockFetchSecure.mockRejectedValue(new Error('network fail'))

    const { fetchSuggestions } = await import('@/features/weather/fetchSuggestions')
    const result = await fetchSuggestions('anything')

    expect(result).toEqual([])
  })
})
