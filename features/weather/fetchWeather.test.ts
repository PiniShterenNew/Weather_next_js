import { fetchWeather } from '@/features/weather/fetchWeather';
import { vi } from 'vitest';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('fetchWeather', () => {
  const mockData = { id: '123', name: 'Tel Aviv', temp: 26 };

  it('calls fetch with correct query params and returns data', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const result = await fetchWeather({
      lat: 32.07,
      lon: 34.79,
      name: 'Tel Aviv',
      country: 'IL',
      lang: 'he',
      unit: 'metric',
      id: '123',
    });

    expect(fetch).toHaveBeenCalledWith(
      '/api/weather?lat=32.07&lon=34.79&name=Tel Aviv&country=IL&lang=he&unit=metric'
    );

    expect(result).toEqual(mockData);
  });

  it('throws if fetch response is not ok', async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
    });

    await expect(
      fetchWeather({
        lat: 1,
        lon: 2,
        name: 'City',
        country: 'US',
        lang: 'en',
        unit: 'imperial',
        id: '1',
      })
    ).rejects.toThrow('Failed to fetch weather');
  });

  it('throws if fetch throws', async () => {
    (fetch as any).mockRejectedValue(new Error('Network error'));

    await expect(
      fetchWeather({
        lat: 1,
        lon: 2,
        name: 'City',
        country: 'US',
        lang: 'en',
        unit: 'imperial',
        id: '1',
      })
    ).rejects.toThrow('Network error');
  });
});
