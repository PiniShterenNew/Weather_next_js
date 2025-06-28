// tests/api/suggestRoute.test.ts
import { GET as suggestRoute } from '@/app/api/suggest/route';
import { vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/helpers', () => ({
  getSuggestions: vi.fn(),
}));

import { getSuggestions } from '@/lib/helpers';

function createRequest(query: string = '') {
  const url = new URL(`http://localhost/api/suggest?q=${query}`);
  return new NextRequest(url.toString(), { method: 'GET' });
}

describe('GET /api/suggest', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns empty array if query is missing', async () => {
    const request = createRequest();
    const response = await suggestRoute(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual([]);
  });

  it('returns suggestions for valid query', async () => {
    const mockData = ['Tel Aviv', 'Tiberias'];
    (getSuggestions as any).mockResolvedValue(mockData);

    const request = createRequest('tel');
    const response = await suggestRoute(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockData);
    expect(getSuggestions).toHaveBeenCalledWith('tel');
  });

  it('returns 500 if getSuggestions fails', async () => {
    (getSuggestions as any).mockRejectedValue(new Error('fail'));

    const request = createRequest('haifa');
    const response = await suggestRoute(request);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Failed to fetch suggestions');
  });
});
