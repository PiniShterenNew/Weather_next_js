import { fetchReverse } from '@/features/weather/fetchReverse';
import { vi } from 'vitest';

describe('fetchReverse', () => {
  const mockCity = { name: 'Tel Aviv', country: 'IL', lat: 32.07, lon: 34.79 };
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    vi.doMock('@/lib/fetchSecure', () => ({
      fetchSecure: mockFetch,
    }));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('calls fetchSecure with correct URL and returns parsed city info', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockCity,
    });

    const { fetchReverse: subject } = await import('@/features/weather/fetchReverse');
    const result = await subject(32.07, 34.79, 'he');

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/reverse?lat=32.07&lon=34.79&lang=he',
      expect.objectContaining({ requireAuth: true }),
    );
    expect(result).toEqual(mockCity);
  });

  it('throws an error if response is not ok', async () => {
    mockFetch.mockResolvedValue({ ok: false });

    const { fetchReverse: subject } = await import('@/features/weather/fetchReverse');
    await expect(subject(1, 2, 'en')).rejects.toThrow('Failed to fetch city suggestions');
  });
});
