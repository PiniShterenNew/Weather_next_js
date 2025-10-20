import { prisma } from '@/prisma/prisma';
import type { FullCityEntryServer } from '@/types/cache';

export async function findCityById(id: string): Promise<FullCityEntryServer | null> {
  const city = await prisma.city.findUnique({
    where: {
      id,
    },
  });

  return city ? {
    id: city.id,
    lat: city.lat,
    lon: city.lon,
    city: { en: city.cityEn, he: city.cityHe },
    country: { en: city.countryEn, he: city.countryHe },
  } : null;
}

export async function findCitiesByQuery(query: string): Promise<FullCityEntryServer[]> {
  const cleanQuery = query.trim();
  
  // Search for cities that start with the query (case insensitive)
  const results = await prisma.city.findMany({
    where: {
      OR: [
        { cityHe: { startsWith: cleanQuery, mode: 'insensitive' } },
        { cityEn: { startsWith: cleanQuery, mode: 'insensitive' } },
      ],
    },
    // Prioritize exact matches and sort by relevance
    orderBy: [
      // First, prioritize exact name matches
      { cityEn: 'asc' },
      { cityHe: 'asc' },
      // Then by country to group similar cities
      { countryEn: 'asc' },
    ],
    take: 8,
  });

  // Remove duplicates based on coordinates (same city, different names)
  const uniqueResults = new Map<string, typeof results[0]>();
  
  for (const city of results) {
    const coordKey = `${city.lat.toFixed(1)},${city.lon.toFixed(1)}`;
    if (!uniqueResults.has(coordKey)) {
      uniqueResults.set(coordKey, city);
    }
  }

  // Convert to output format and limit to 5 results
  return Array.from(uniqueResults.values())
    .slice(0, 5)
    .map((c) => ({
      id: c.id,
      lat: c.lat,
      lon: c.lon,
      city: { en: c.cityEn, he: c.cityHe },
      country: { en: c.countryEn, he: c.countryHe },
    }));
}

export async function saveCityToDatabase(city: {
  id: string;
  lat: number;
  lon: number;
  city: { en: string; he: string };
  country: { en: string; he: string };
}): Promise<FullCityEntryServer> {
  const saved = await prisma.city.upsert({
    where: { id: city.id },
    update: {
      lat: city.lat,
      lon: city.lon,
      cityEn: city.city.en,
      cityHe: city.city.he,
      countryEn: city.country.en,
      countryHe: city.country.he,
    },
    create: {
      id: city.id,
      lat: city.lat,
      lon: city.lon,
      cityEn: city.city.en,
      cityHe: city.city.he,
      countryEn: city.country.en,
      countryHe: city.country.he,
    },
  });

  return {
    id: saved.id,
    lat: saved.lat,
    lon: saved.lon,
    city: { en: saved.cityEn, he: saved.cityHe },
    country: { en: saved.countryEn, he: saved.countryHe },
  };
}
