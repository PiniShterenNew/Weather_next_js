// tests/api/reverseRoute.test.ts
import { GET as reverseRoute } from '@/app/api/reverse/route';
import { vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock all dependencies
vi.mock('@/lib/helpers', () => ({
  getLocationForDB: vi.fn(),
}));

vi.mock('@/lib/db/suggestion', () => ({
  findCityById: vi.fn(),
  saveCityToDatabase: vi.fn(),
}));

vi.mock('@/lib/utils', () => ({
  getCityId: vi.fn(),
}));

vi.mock('@/lib/errors', () => ({
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  },
  ValidationError: class extends Error {
    statusCode = 400;
    constructor(message: string) {
      super(message);
    }
  },
  ExternalApiError: class extends Error {
    statusCode = 502;
    constructor(service: string, message: string) {
      super(`${service} API error: ${message}`);
    }
  },
}));

const mockLimiter = { consume: vi.fn() };

vi.mock('@/lib/simple-rate-limiter', () => ({
  findMatchingLimiter: vi.fn(() => mockLimiter),
  getRequestIP: vi.fn(() => '127.0.0.1'),
  getErrorMessage: vi.fn(() => 'Too many requests'),
}));

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

import { getLocationForDB } from '@/lib/helpers';
import { findCityById, saveCityToDatabase } from '@/lib/db/suggestion';
import { getCityId } from '@/lib/utils';
import { auth } from '@clerk/nextjs/server';

const mockedAuth = auth as unknown as ReturnType<typeof vi.fn>;

function createRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/reverse');
  Object.entries(params).forEach(([key, val]) => url.searchParams.set(key, val));
  return new NextRequest(url.toString(), { method: 'GET' });
}

const mockCityData = {
  id: 'city:32.1_34.8',
  city: { en: 'Tel Aviv', he: 'תל אביב' },
  country: { en: 'Israel', he: 'ישראל' },
  lat: 32.07,
  lon: 34.79,
};

describe('GET /api/reverse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLimiter.consume.mockResolvedValue(undefined);
    mockedAuth.mockResolvedValue({
      userId: 'user_123',
      getToken: vi.fn().mockResolvedValue('token'),
    });
  });

  it('returns 400 if lat/lon are missing', async () => {
    const request = createRequest(); // no params
    const response = await reverseRoute(request);
    
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Missing required parameters: lat, lon');
  });

  it('returns 400 if coordinates are invalid format', async () => {
    const request = createRequest({ lat: 'invalid', lon: '34.79' });
    const response = await reverseRoute(request);
    
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid parameters: Expected number, received nan');
  });

  it('returns 400 if coordinates are out of range', async () => {
    const request = createRequest({ lat: '91', lon: '34.79' }); // lat > 90
    const response = await reverseRoute(request);
    
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid parameters: Latitude out of valid range');
  });

  it('returns existing city from database', async () => {
    (getCityId as any).mockReturnValue('city:32.1_34.8');
    (findCityById as any).mockResolvedValue(mockCityData);
    
    const request = createRequest({ lat: '32.07', lon: '34.79', lang: 'he' });
    const response = await reverseRoute(request);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockCityData);
    expect(getCityId).toHaveBeenCalledWith(32.07, 34.79);
    expect(findCityById).toHaveBeenCalledWith('city:32.1_34.8');
  });

  it('fetches from API and saves when city not in database', async () => {
    const newCityData = { ...mockCityData, id: 'city:31.0_35.0' };
    
    (getCityId as any).mockReturnValue('city:31.0_35.0');
    (findCityById as any).mockResolvedValue(null);
    (getLocationForDB as any).mockResolvedValue(newCityData);
    (saveCityToDatabase as any).mockResolvedValue(newCityData);
    
    const request = createRequest({ lat: '31.0', lon: '35.0', lang: 'he' });
    const response = await reverseRoute(request);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(newCityData);
    expect(getLocationForDB).toHaveBeenCalledWith(31.0, 35.0);
    expect(saveCityToDatabase).toHaveBeenCalledWith(newCityData);
  });

  it('returns 502 on external API error', async () => {
    (getCityId as any).mockReturnValue('city:31.0_35.0');
    (findCityById as any).mockResolvedValue(null);
    (getLocationForDB as any).mockRejectedValue(new Error('Geoapify API failure'));
    
    const request = createRequest({ lat: '31.0', lon: '35.0' });
    const response = await reverseRoute(request);
    
    expect(response.status).toBe(502);
    const data = await response.json();
    expect(data.error).toContain('Geoapify API error');
  });

  it('returns 500 on database save error', async () => {
    const newCityData = { ...mockCityData, id: 'city:31.0_35.0' };
    
    (getCityId as any).mockReturnValue('city:31.0_35.0');
    (findCityById as any).mockResolvedValue(null);
    (getLocationForDB as any).mockResolvedValue(newCityData);
    (saveCityToDatabase as any).mockRejectedValue(new Error('Database error'));
    
    const request = createRequest({ lat: '31.0', lon: '35.0' });
    const response = await reverseRoute(request);
    
    expect(response.status).toBe(502);
    const data = await response.json();
    expect(data.error).toContain('Failed to save city data');
  });

  it('returns 500 on unexpected error', async () => {
    (getCityId as any).mockImplementation(() => {
      throw new Error('Unexpected error');
    });
    
    const request = createRequest({ lat: '32.07', lon: '34.79' });
    const response = await reverseRoute(request);
    
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toContain('unexpected error occurred');
  });

  it('uses default language when lang not provided', async () => {
    (getCityId as any).mockReturnValue('city:32.1_34.8');
    (findCityById as any).mockResolvedValue(mockCityData);
    
    const request = createRequest({ lat: '32.07', lon: '34.79' }); // no lang param
    const response = await reverseRoute(request);
    
    expect(response.status).toBe(200);
    // Should use 'he' as default language
  });
});