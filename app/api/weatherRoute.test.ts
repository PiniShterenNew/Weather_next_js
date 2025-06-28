// tests/api/weatherRoute.test.ts
import { GET as weatherRoute } from '@/app/api/weather/route';
import { vi } from 'vitest';
import { NextRequest } from 'next/server';

// מוקים
vi.mock('@/lib/helpers', () => ({
  getWeatherByCoords: vi.fn(),
}));

import { getWeatherByCoords } from '@/lib/helpers';

function createRequest(query: Record<string, string>) {
  const url = new URL('http://localhost/api/weather');
  Object.entries(query).forEach(([key, value]) => url.searchParams.set(key, value));

  return new NextRequest(url.toString(), { method: 'GET' });
}

describe('GET /api/weather', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns 400 if lat/lon are missing', async () => {
    const request = createRequest({}); // no lat/lon
    const response = await weatherRoute(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ error: 'Missing coordinates' });
  });

  it('returns weather data for valid query', async () => {
    const mockData = { city: 'Test City', temp: 25 };
    (getWeatherByCoords as any).mockResolvedValue(mockData);

    const request = createRequest({
      lat: '32.07',
      lon: '34.79',
      name: 'Tel Aviv',
      country: 'IL',
      lang: 'en',
      unit: 'imperial',
    });

    const response = await weatherRoute(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockData);

    expect(getWeatherByCoords).toHaveBeenCalledWith({
      lat: 32.07,
      lon: 34.79,
      name: 'Tel Aviv',
      country: 'IL',
      lang: 'en',
      unit: 'imperial',
    });
  });

  it('returns 500 on internal error', async () => {
    (getWeatherByCoords as any).mockRejectedValue(new Error('Failure'));

    const request = createRequest({
      lat: '32.07',
      lon: '34.79',
      name: 'Tel Aviv',
      country: 'IL',
    });

    const response = await weatherRoute(request);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({ error: 'Failed to fetch weather' });
  });
});
