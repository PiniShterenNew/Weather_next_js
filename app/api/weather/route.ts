// app/api/weather/route.ts
// /api/weather?lat=43.6511&lon=-79.3832&name=undefined&country=undefined&unit=metric
import { NextRequest, NextResponse } from 'next/server';
import { getWeatherByCoords } from '@/lib/helpers';
import { CityWeather } from '@/types/weather';
import { getCachedWeather, getCacheStats, setCachedWeather } from '@/lib/weatherCache';
import { findCityById } from '@/lib/db/suggestion';
import { logger, NotFoundError, ExternalApiError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const id = searchParams.get('id');

  // Input validation
  if (!lat || !lon || !id) {
    const missingParams = [];
    if (!lat) missingParams.push('lat');
    if (!lon) missingParams.push('lon');
    if (!id) missingParams.push('id');

    logger.warn(`Weather API called with missing parameters: ${missingParams.join(', ')}`);
    return NextResponse.json(
      { error: `Missing required parameters: ${missingParams.join(', ')}` },
      { status: 400 }
    );
  }

  try {
    const existing = await findCityById(id);

    if (!existing) {
      logger.warn(`City not found in database with ID: ${id}`);
      throw new NotFoundError(`City with ID ${id}`);
    }

    logger.info(`Fetching weather for city: ${existing.city.en} (${existing.id})`);

    const cachedWeather = getCachedWeather(existing.id);
    if (cachedWeather) {
      logger.debug(`Cache hit for city ID: ${existing.id}, returning cached data`);
      return NextResponse.json(cachedWeather);
    }

    logger.debug(`Cache miss for city ID: ${existing.id}, fetching from API`);

    // Fetch from external API
    try {
      const { he, en } = await getWeatherByCoords({
        lat: existing.lat,
        lon: existing.lon,
        name: existing.city,
        country: existing.country
      });

      const result: CityWeather = {
        id: existing.id,
        lat: existing.lat,
        lon: existing.lon,
        name: existing.city,
        country: existing.country,
        currentHe: he,
        currentEn: en,
        lastUpdated: Date.now()
      };

      // Save to cache
      await setCachedWeather(result);

      // Log cache stats occasionally
      if (Math.random() < 0.1) { // Log only ~10% of the time to avoid excessive logging
        const stats = getCacheStats();
        logger.debug(`Weather cache stats: ${stats.size} entries, oldest: ${stats.oldestEntry}ms`);
      }

      return NextResponse.json(result);
    } catch (weatherError: unknown) {
      const message = weatherError instanceof Error ? weatherError.message : 'Unknown error';
      logger.error(`Weather API error for ${existing.id}`, weatherError as Error);
      throw new ExternalApiError('Weather', message);
    }
  } catch (error: unknown) {
    // Handle different error types
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    } else if (error instanceof ExternalApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    } else {
      logger.error('Unexpected error in weather API', error as Error);
      return NextResponse.json(
        { error: 'An unexpected error occurred while fetching weather data' },
        { status: 500 }
      );
    }
  }
}