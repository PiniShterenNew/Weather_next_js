// api/suggest?q=tel%20aviv

export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

import { findCitiesByQuery, saveCityToDatabase } from '@/lib/db/suggestion';
import { logger, ValidationError, ExternalApiError } from '@/lib/errors';
import { getSuggestionsForDB } from '@/lib/helpers';
import { findMatchingLimiter, getErrorMessage, getRequestIP } from '@/lib/simple-rate-limiter';
import type { FullCityEntryServer } from '@/types/cache';
import { AppLocale } from '@/types/i18n';

const SuggestQuerySchema = z.object({
  q: z.string().min(2, 'Search query must be at least 2 characters').transform((value) => value.trim()),
  lang: z.enum(['he', 'en']).default('he'),
});

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

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get('q');
  const langParam = (searchParams.get('lang') || 'he') as AppLocale;

  if (rawQuery === null) {
    logger.debug('Suggest API called without query parameter');
    return NextResponse.json([], { status: 200 });
  }

  if (rawQuery.trim().length === 0) {
    logger.debug('Suggest API called with empty query');
    return NextResponse.json([], { status: 200 });
  }

  const parseResult = SuggestQuerySchema.safeParse({
    q: rawQuery,
    lang: langParam,
  });

  if (!parseResult.success) {
    const details = parseResult.error.issues.map((issue) => issue.message).join(', ');
    logger.warn(`Suggest API called with invalid parameters: ${details}`);
    return NextResponse.json({ error: details }, { status: 400 });
  }

  const { q, lang } = parseResult.data;

  logger.info(`City suggestion request for: "${q}" (lang: ${lang})`);

  try {
    // 1. Try to find cities already in DB
    const existing = await findCitiesByQuery(q);

    if (existing.length > 0) {
      logger.debug(`Found ${existing.length} matching cities in database for query: "${q}"`);
      return NextResponse.json(existing);
    }

    logger.debug(`No cities found in database for query: "${q}", fetching from API`);

    // 2. Fetch from Geoapify and save
    try {
      logger.info(`Attempting to fetch suggestions from Geoapify for query: "${q}" (lang: ${lang})`);
      const suggestions = await getSuggestionsForDB(q, lang);
      logger.info(`Fetched ${suggestions.length} suggestions from Geoapify for query: "${q}"`);

      if (suggestions.length === 0) {
        logger.warn(`No suggestions found for query: "${q}" (lang: ${lang})`);
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

      logger.info(`Successfully processed ${saved.length} cities for query: "${q}"`);
      return NextResponse.json(saved);
    } catch (apiError: unknown) {
      const message = apiError instanceof Error ? apiError.message : 'Unknown error';
      logger.error(`Geoapify API error for query: "${q}"`, apiError as Error);
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
