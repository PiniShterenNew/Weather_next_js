// app/api/weather/route.ts
// /api/weather?lat=43.6511&lon=-79.3832&id=city:43.65_-79.38&lang=he

export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

import { logger } from '@/lib/errors';
import { getWeatherCached } from '@/lib/server/weather';
import { findMatchingLimiter, getErrorMessage, getRequestIP } from '@/lib/simple-rate-limiter';

const WeatherQuerySchema = z.object({
  id: z.string().min(1, 'id is required'),
  lat: z.coerce.number().refine((value) => Number.isFinite(value) && value >= -90 && value <= 90, 'Latitude out of range'),
  lon: z.coerce.number().refine((value) => Number.isFinite(value) && value >= -180 && value <= 180, 'Longitude out of range'),
  lang: z.enum(['he', 'en']).default('he'),
});

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const ip = getRequestIP(request);
  const limiter = findMatchingLimiter('/api/weather');

  try {
    await limiter.consume(ip);
  } catch {
    const locale = request.nextUrl.pathname.includes('/en') ? 'en' : 'he';
    return NextResponse.json(
      { error: getErrorMessage(locale) },
      { status: 429, headers: { 'Retry-After': '60' } },
    );
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parseResult = WeatherQuerySchema.safeParse({
    id: searchParams.get('id'),
    lat: searchParams.get('lat'),
    lon: searchParams.get('lon'),
    lang: searchParams.get('lang') ?? undefined,
  });

  if (!parseResult.success) {
    const details = parseResult.error.issues.map((issue) => issue.message).join(', ');
    return NextResponse.json({ error: `Invalid query parameters: ${details}` }, { status: 400 });
  }

  const { id, lat, lon, lang } = parseResult.data;

  try {
    const weather = await getWeatherCached(id, lat, lon, lang);

    if (!weather) {
      return NextResponse.json({ error: 'Weather data not available' }, { status: 404 });
    }

    return NextResponse.json(weather, { status: 200 });
  } catch (error) {
    logger.error('Weather API error', error as Error);
    return NextResponse.json({ error: 'An unexpected error occurred while fetching weather data' }, { status: 500 });
  }
}