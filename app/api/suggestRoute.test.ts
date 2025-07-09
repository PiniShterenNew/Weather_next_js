// tests/api/suggestRoute.test.ts
import { GET as suggestRoute } from '@/app/api/suggest/route';
import { vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock all dependencies
vi.mock('@/lib/helpers', () => ({
  getSuggestionsForDB: vi.fn(),
}));

vi.mock('@/lib/db/suggestion', () => ({
  findCitiesByQuery: vi.fn(),
  saveCityToDatabase: vi.fn(),
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

import { getSuggestionsForDB } from '@/lib/helpers';
import { findCitiesByQuery, saveCityToDatabase } from '@/lib/db/suggestion';
import { FullCityEntryServer } from '@/types/cache';

function createRequest(query: string = '', lang: string = 'he') {
  const url = new URL('http://localhost/api/suggest');
  if (query) url.searchParams.set('q', query);
  if (lang !== 'he') url.searchParams.set('lang', lang);
  return new NextRequest(url.toString(), { method: 'GET' });
}

const mockCitiesData = [
  {
    id: 'city:32.1_34.8',
    city: { en: 'Tel Aviv', he: 'תל אביב' },
    country: { en: 'Israel', he: 'ישראל' },
    lat: 32.07,
    lon: 34.79,
  },
  {
    id: 'city:32.8_35.0',
    city: { en: 'Tiberias', he: 'טבריה' },
    country: { en: 'Israel', he: 'ישראל' },
    lat: 32.795,
    lon: 35.0,
  }
];

describe('GET /api/suggest', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns empty array if query is missing', async () => {
    const request = createRequest(); // no query
    const response = await suggestRoute(request);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual([]);
  });

  it('returns empty array if query is empty string', async () => {
    const request = createRequest('   '); // empty/whitespace query
    const response = await suggestRoute(request);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual([]);
  });

  it('returns 400 if query is too short', async () => {
    const request = createRequest('a'); // single character
    const response = await suggestRoute(request);
    
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Search query must be at least 2 characters');
  });

  it('returns existing cities from database', async () => {
    (findCitiesByQuery as any).mockResolvedValue(mockCitiesData);
    
    const request = createRequest('tel', 'en');
    const response = await suggestRoute(request);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockCitiesData);
    expect(findCitiesByQuery).toHaveBeenCalledWith('tel');
    expect(getSuggestionsForDB).not.toHaveBeenCalled();
  });

  it('fetches from API and saves when no cities in database', async () => {
    (findCitiesByQuery as any).mockResolvedValue([]);
    (getSuggestionsForDB as any).mockResolvedValue(mockCitiesData);
    (saveCityToDatabase as any).mockImplementation((city: FullCityEntryServer) => Promise.resolve(city));
    
    const request = createRequest('haifa', 'en');
    const response = await suggestRoute(request);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockCitiesData);
    expect(getSuggestionsForDB).toHaveBeenCalledWith('haifa', 'en');
    expect(saveCityToDatabase).toHaveBeenCalledTimes(2);
  });

  it('continues saving other cities if one fails to save', async () => {
    (findCitiesByQuery as any).mockResolvedValue([]);
    (getSuggestionsForDB as any).mockResolvedValue(mockCitiesData);
    (saveCityToDatabase as any)
      .mockRejectedValueOnce(new Error('Save failed'))
      .mockResolvedValueOnce(mockCitiesData[1]);
    
    const request = createRequest('test');
    const response = await suggestRoute(request);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual([mockCitiesData[1]]); // Only the successfully saved city
    expect(saveCityToDatabase).toHaveBeenCalledTimes(2);
  });

  it('returns 502 on external API error', async () => {
    (findCitiesByQuery as any).mockResolvedValue([]);
    (getSuggestionsForDB as any).mockRejectedValue(new Error('Geoapify API failure'));
    
    const request = createRequest('error');
    const response = await suggestRoute(request);
    
    expect(response.status).toBe(502);
    const data = await response.json();
    expect(data.error).toContain('Geoapify API error');
  });

  it('returns 500 on unexpected error', async () => {
    (findCitiesByQuery as any).mockRejectedValue(new Error('Database error'));
    
    const request = createRequest('test');
    const response = await suggestRoute(request);
    
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toContain('unexpected error occurred');
  });

  it('uses default language when lang not provided', async () => {
    (findCitiesByQuery as any).mockResolvedValue([]);
    (getSuggestionsForDB as any).mockResolvedValue(mockCitiesData);
    (saveCityToDatabase as any).mockImplementation((city: FullCityEntryServer) => Promise.resolve(city));
    
    const request = createRequest('tel'); // no lang param
    const response = await suggestRoute(request);
    
    expect(response.status).toBe(200);
    expect(getSuggestionsForDB).toHaveBeenCalledWith('tel', 'he'); // Should use 'he' as default
  });

  it('handles custom language parameter', async () => {
    (findCitiesByQuery as any).mockResolvedValue([]);
    (getSuggestionsForDB as any).mockResolvedValue(mockCitiesData);
    (saveCityToDatabase as any).mockImplementation((city: FullCityEntryServer) => Promise.resolve(city));
    
    const request = createRequest('tel', 'en');
    const response = await suggestRoute(request);
    
    expect(response.status).toBe(200);
    expect(getSuggestionsForDB).toHaveBeenCalledWith('tel', 'en');
  });
});