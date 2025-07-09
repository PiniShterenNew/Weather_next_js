import { NextRequest, NextResponse } from 'next/server';
import { getLocationForDB } from '@/lib/helpers';
import { AppLocale } from '@/types/i18n';
import { findCityById, saveCityToDatabase } from '@/lib/db/suggestion';
import { getCityId } from '@/lib/utils';
import { logger, ValidationError, ExternalApiError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const lang = (searchParams.get('lang') || 'he') as AppLocale;

  // Input validation
  if (!lat || !lon) {
    const missingParams = [];
    if (!lat) missingParams.push('lat');
    if (!lon) missingParams.push('lon');
    
    logger.warn(`Reverse API called with missing parameters: ${missingParams.join(', ')}`);
    return NextResponse.json(
      { error: `Missing required parameters: ${missingParams.join(', ')}` }, 
      { status: 400 }
    );
  }

  // Validate coordinates format
  const latNum = Number.parseFloat(lat);
  const lonNum = Number.parseFloat(lon);
  
  if (isNaN(latNum) || isNaN(lonNum)) {
    logger.warn(`Reverse API called with invalid coordinates: lat=${lat}, lon=${lon}`);
    return NextResponse.json(
      { error: 'Invalid coordinates format' }, 
      { status: 400 }
    );
  }

  // Validate coordinates range
  if (latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
    logger.warn(`Reverse API called with out-of-range coordinates: lat=${latNum}, lon=${lonNum}`);
    return NextResponse.json(
      { error: 'Coordinates out of valid range' }, 
      { status: 400 }
    );
  }

  logger.info(`Reverse geocode request for: lat=${latNum}, lon=${lonNum} (lang: ${lang})`);

  try {
    // Generate city ID from coordinates
    const cityId = getCityId(latNum, lonNum);
    
    // Try to find city in database first
    const existing = await findCityById(cityId);
    if (existing) {
      logger.debug(`Found existing city in database for coordinates: lat=${latNum}, lon=${lonNum}, id=${cityId}`);
      return NextResponse.json(existing);
    }

    logger.debug(`No city found in database for coordinates: lat=${latNum}, lon=${lonNum}, fetching from API`);
    
    // Fetch from external API
    try {
      const primaryInfo = await getLocationForDB(latNum, lonNum);
      logger.debug(`Successfully fetched location data from Geoapify for coordinates: lat=${latNum}, lon=${lonNum}`);
      
      // Save to database
      try {
        const saved = await saveCityToDatabase(primaryInfo);
        logger.debug(`Successfully saved city to database: ${saved.id}`);
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
