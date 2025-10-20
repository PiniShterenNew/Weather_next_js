// prisma/seed.ts
import { seedPopularCities } from '../lib/db/seedPopularCities';
import { prisma } from './prisma';

seedPopularCities()
  .catch(() => { process.exit(1); })
  .finally(() => prisma.$disconnect());
