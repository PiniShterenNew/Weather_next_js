// api/suggest?q=tel%20aviv
import { NextRequest, NextResponse } from 'next/server';
import { getSuggestionsForDB } from '@/lib/helpers';
import { findCitiesByQuery, saveCityToDatabase } from '@/lib/db/suggestion';
import type { FullCityEntryServer } from '@/types/cache';
import { AppLocale } from '@/types/i18n';
import { logger, ValidationError, ExternalApiError } from '@/lib/errors';

export async function GET(request: NextRequest) {
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
      const suggestions = await getSuggestionsForDB(query, lang);
      logger.debug(`Fetched ${suggestions.length} suggestions from Geoapify for query: "${query}"`);

      const saved: FullCityEntryServer[] = [];

      for (const suggestion of suggestions) {
        try {
          const result = await saveCityToDatabase(suggestion);
          saved.push(result);
        } catch (saveError: unknown) {
          // Log error but continue with other suggestions
          logger.error(`Failed to save city to database: ${suggestion.id}`, saveError as Error);
        }
      }

      logger.debug(`Successfully saved ${saved.length} cities to database`);
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
