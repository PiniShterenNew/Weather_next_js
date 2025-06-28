import { fetchReverse } from '@/features/weather/fetchReverse';
import { vi } from 'vitest';

describe('fetchReverse', () => {
  const mockCity = { name: 'Tel Aviv', country: 'IL', lat: 32.07, lon: 34.79 };

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls fetch with correct URL and returns parsed city info', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockCity,
    });

    const result = await fetchReverse(32.07, 34.79, 'he');

    expect(fetch).toHaveBeenCalledWith('/api/reverse?lat=32.07&lon=34.79&lang=he');
    expect(result).toEqual(mockCity);
  });

  it('throws an error if response is not ok', async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
    });

    await expect(fetchReverse(1, 2, 'en')).rejects.toThrow('Failed to fetch city suggestions');
  });
});
