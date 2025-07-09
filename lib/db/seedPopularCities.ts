// lib/db/seedPopularCities.ts
import { prisma } from '@/prisma/prisma';
import { popularCitiesServer } from '@/constants/popularCitiesServer';

export async function seedPopularCities() {
  for (const city of popularCitiesServer) {
      const exists = await prisma.city.findUnique({
        where: { id: city.id },
      });

      if (exists) continue;

      await prisma.city.create({
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
  }
}
