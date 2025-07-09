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
  const cities = await prisma.city.findMany({
    where: {
      OR: [
        { cityHe: { contains: query } },
        { cityEn: { contains: query } },
      ],
    },
    take: 5,
  });

  return cities.map((c) => ({
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
  const saved = await prisma.city.create({
    data: {
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
