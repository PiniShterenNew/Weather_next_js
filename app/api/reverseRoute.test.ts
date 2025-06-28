// tests/api/reverseRoute.test.ts
import { GET as reverseRoute } from '@/app/api/reverse/route';
import { vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/helpers', () => ({
  getCityInfoByCoords: vi.fn(),
}));

import { getCityInfoByCoords } from '@/lib/helpers';

function createRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/reverse');
  Object.entries(params).forEach(([key, val]) => url.searchParams.set(key, val));
  return new NextRequest(url.toString(), { method: 'GET' });
}

describe('GET /api/reverse', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns empty array if lat/lon are missing', async () => {
    const request = createRequest(); // no params
    const response = await reverseRoute(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual([]);
  });

  it('returns city info if lat/lon provided', async () => {
    const mockCity = { name: 'Tel Aviv', country: 'IL' };
    (getCityInfoByCoords as any).mockResolvedValue(mockCity);

    const request = createRequest({ lat: '32.07', lon: '34.79', lang: 'he' });
    const response = await reverseRoute(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockCity);
    expect(getCityInfoByCoords).toHaveBeenCalledWith(32.07, 34.79, 'he');
  });

  it('returns 500 on failure', async () => {
    (getCityInfoByCoords as any).mockRejectedValue(new Error('fail'));

    const request = createRequest({ lat: '31', lon: '35' });
    const response = await reverseRoute(request);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toContain('Failed to fetch');
  });
});
