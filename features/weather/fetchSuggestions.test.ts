import { fetchSuggestions } from '@/features/weather/fetchSuggestions';
import { vi } from 'vitest';

describe('fetchSuggestions (using fetch)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockSuggestions = ['Tel Aviv', 'Tiberias'];

  it('calls fetch with correct query string and returns data', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockSuggestions,
    });

    const result = await fetchSuggestions('tel');

    expect(fetch).toHaveBeenCalledWith('/api/suggest?q=tel');
    expect(result).toEqual(mockSuggestions);
  });

  it('throws an error if fetch response is not ok', async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
    });

    await expect(fetchSuggestions('x')).rejects.toThrow('Failed to fetch city suggestions');
  });

  it('throws an error if fetch itself fails', async () => {
    (fetch as any).mockRejectedValue(new Error('network fail'));

    await expect(fetchSuggestions('anything')).rejects.toThrow('network fail');
  });
});
