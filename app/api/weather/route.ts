// app/api/weather/route.ts
// /api/weather?lat=43.6511&lon=-79.3832&id=city:43.65_-79.38&lang=he

export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getWeatherCached } from '@/lib/server/weather';
import { findMatchingLimiter, getErrorMessage, getRequestIP } from '@/lib/simple-rate-limiter';

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
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const id = searchParams.get('id');
  const lang = searchParams.get('lang') as 'he' | 'en' || 'he';

  // Input validation
  if (!lat || !lon || !id) {
    const missingParams = [];
    if (!lat) missingParams.push('lat');
    if (!lon) missingParams.push('lon');
    if (!id) missingParams.push('id');

    return NextResponse.json(
      { error: `Missing required parameters: ${missingParams.join(', ')}` },
      { status: 400 }
    );
  }

  try {
    const weather = await getWeatherCached(
      id,
      parseFloat(lat),
      parseFloat(lon),
      lang
    );

    if (!weather) {
      return NextResponse.json(
        { error: 'Weather data not available' },
        { status: 404 }
      );
    }

    return NextResponse.json(weather);
  } catch {
    // console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching weather data' },
      { status: 500 }
    );
  }
}