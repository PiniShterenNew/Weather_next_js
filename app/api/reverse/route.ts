export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

import { getLocationForDB } from '@/lib/helpers';
import { AppLocale } from '@/types/i18n';
import { findCityById, saveCityToDatabase } from '@/lib/db/suggestion';
import { getCityId } from '@/lib/utils';
import { logger, ValidationError, ExternalApiError } from '@/lib/errors';
import { findMatchingLimiter, getErrorMessage, getRequestIP } from '@/lib/simple-rate-limiter';

const ReverseQuerySchema = z.object({
  lat: z.coerce.number().refine((value) => Number.isFinite(value) && value >= -90 && value <= 90, 'Latitude out of valid range'),
  lon: z.coerce.number().refine((value) => Number.isFinite(value) && value >= -180 && value <= 180, 'Longitude out of valid range'),
  lang: z.enum(['he', 'en']).default('he'),
});

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const ip = getRequestIP(request);
  const limiter = findMatchingLimiter('/api/reverse');
  
  try {
    await limiter.consume(ip);
  } catch {
    const { searchParams } = new URL(request.url);
    const lang = (searchParams.get('lang') || 'he') as AppLocale;
    return NextResponse.json(
      { error: getErrorMessage(lang) },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const latParam = searchParams.get('lat');
  const lonParam = searchParams.get('lon');

  if (latParam === null || lonParam === null) {
    logger.warn('Reverse API called without required lat/lon parameters');
    return NextResponse.json({ error: 'Missing required parameters: lat, lon' }, { status: 400 });
  }

  const parseResult = ReverseQuerySchema.safeParse({
    lat: latParam ?? undefined,
    lon: lonParam ?? undefined,
    lang: searchParams.get('lang') ?? undefined,
  });

  if (!parseResult.success) {
    const issues = parseResult.error.issues.map((issue) => issue.message).join(', ');
    logger.warn(`Reverse API called with invalid parameters: ${issues}`);
    return NextResponse.json({ error: `Invalid parameters: ${issues}` }, { status: 400 });
  }

  const { lat: latNum, lon: lonNum, lang } = parseResult.data;

  logger.info(`Reverse geocode request for: lat=${latNum}, lon=${lonNum} (lang: ${lang})`);

  try {
    // Generate city ID from coordinates
    const cityId = getCityId(latNum, lonNum);
    
    // Try to find city in database first
    const existing = await findCityById(cityId);
    if (existing) {
      logger.debug(`Found existing city in database for coordinates: lat=${latNum}, lon=${lonNum}, id=${cityId}, city: ${existing.cityEn || existing.cityHe}`);
      
      // Validate stored coordinates match requested coordinates (within reasonable tolerance)
      const coordDiff = Math.abs(existing.lat - latNum) + Math.abs(existing.lon - lonNum);
      if (coordDiff > 0.1) {
        logger.warn(`Coordinate mismatch in cached city: requested (${latNum}, ${lonNum}), cached (${existing.lat}, ${existing.lon}), difference: ${coordDiff}`);
        // Fetch fresh data from API if coordinates don't match
      } else {
        return NextResponse.json(existing);
      }
    }

    logger.debug(`No city found in database (or coordinates mismatch) for coordinates: lat=${latNum}, lon=${lonNum}, fetching from API`);
    
    // Fetch from external API
    try {
      const primaryInfo = await getLocationForDB(latNum, lonNum);
      logger.debug(`Successfully fetched location data from Geoapify for coordinates: lat=${latNum}, lon=${lonNum}, city: ${primaryInfo.city.en || primaryInfo.city.he}`);
      
      // Validate the returned coordinates match the request
      const coordDiff = Math.abs(primaryInfo.lat - latNum) + Math.abs(primaryInfo.lon - lonNum);
      if (coordDiff > 0.1) {
        logger.warn(`Geoapify returned different coordinates: requested (${latNum}, ${lonNum}), returned (${primaryInfo.lat}, ${primaryInfo.lon})`);
      }
      
      // Save to database
      try {
        const saved = await saveCityToDatabase(primaryInfo);
        logger.debug(`Successfully saved city to database: ${saved.id}, city: ${saved.cityEn || saved.cityHe}`);
        return NextResponse.json(saved);
      } catch (saveError: unknown) {
        const message = saveError instanceof Error ? saveError.message : 'Unknown error';
        logger.error(`Failed to save city to database: ${primaryInfo.id}`, saveError as Error);
        throw new Error(`Failed to save city data: ${message}`);
      }
    } catch (apiError: unknown) {
      const message = apiError instanceof Error ? apiError.message : 'Unknown error';
      logger.error(`Geoapify API error for coordinates: lat=${latNum}, lon=${lonNum}`, apiError as Error);
      throw new ExternalApiError('Geoapify', message || 'Failed to fetch location data');
    }
  } catch (error: unknown) {
    // Handle different error types
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    } else if (error instanceof ExternalApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    } else {
      logger.error('Unexpected error in reverse geocode API', error as Error);
      return NextResponse.json(
        { error: 'An unexpected error occurred while fetching location data' }, 
        { status: 500 }
      );
    }
  }
}
