// api/suggest?q=tel%20aviv

export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getSuggestionsForDB } from '@/lib/helpers';
import { findCitiesByQuery, saveCityToDatabase } from '@/lib/db/suggestion';
import type { FullCityEntryServer } from '@/types/cache';
import { AppLocale } from '@/types/i18n';
import { logger, ValidationError, ExternalApiError } from '@/lib/errors';
import { findMatchingLimiter, getErrorMessage, getRequestIP } from '@/lib/simple-rate-limiter';

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const ip = getRequestIP(request);
  const limiter = findMatchingLimiter('/api/suggest');
  
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

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const lang = (searchParams.get('lang') || 'he') as AppLocale;

  // Return empty array for empty queries
  if (!query || query.trim().length === 0) {
    logger.debug('Suggest API called with empty query');
    return NextResponse.json([], { status: 200 });
  }

  // Validate query length
  if (query.length < 2) {
    logger.warn(`Suggest API called with too short query: "${query}"`);
    return NextResponse.json(
      { error: 'Search query must be at least 2 characters' },
      { status: 400 }
    );
  }

  logger.info(`City suggestion request for: "${query}" (lang: ${lang})`);

  try {
    // 1. Try to find cities already in DB
    const existing = await findCitiesByQuery(query);

    if (existing.length > 0) {
      logger.debug(`Found ${existing.length} matching cities in database for query: "${query}"`);
      return NextResponse.json(existing);
    }

    logger.debug(`No cities found in database for query: "${query}", fetching from API`);

    // 2. Fetch from Geoapify and save
    try {
      logger.info(`Attempting to fetch suggestions from Geoapify for query: "${query}" (lang: ${lang})`);
      const suggestions = await getSuggestionsForDB(query, lang);
      logger.info(`Fetched ${suggestions.length} suggestions from Geoapify for query: "${query}"`);

      if (suggestions.length === 0) {
        logger.warn(`No suggestions found for query: "${query}" (lang: ${lang})`);
      }

      const saved: FullCityEntryServer[] = [];

      for (const suggestion of suggestions) {
        try {
          const result = await saveCityToDatabase(suggestion);
          saved.push(result);
          logger.debug(`Successfully saved city: ${suggestion.city.en || suggestion.city.he} (${suggestion.id})`);
        } catch (saveError: unknown) {
          // Log error but continue with other suggestions
          logger.error(`Failed to save city to database: ${suggestion.id}`, saveError as Error);
        }
      }

      logger.info(`Successfully processed ${saved.length} cities for query: "${query}"`);
      return NextResponse.json(saved);
    } catch (apiError: unknown) {
      const message = apiError instanceof Error ? apiError.message : 'Unknown error';
      logger.error(`Geoapify API error for query: "${query}"`, apiError as Error);
      throw new ExternalApiError('Geoapify', message || 'Failed to fetch city suggestions');
    }
  } catch (error: unknown) {
    // Handle different error types
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    } else if (error instanceof ExternalApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    } else {
      logger.error('Unexpected error in suggest API', error as Error);
      return NextResponse.json(
        { error: 'An unexpected error occurred while fetching city suggestions' },
        { status: 500 }
      );
    }
  }
}
