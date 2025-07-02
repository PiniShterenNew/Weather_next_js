// src/app/api/weather/route.ts
// GET /api/weather?lat=32.07&lon=34.79&unit=metric
import { NextRequest, NextResponse } from 'next/server';
import { getWeatherByCoords } from '@/lib/helpers';
import { AppLocale } from '@/types/i18n';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const name = searchParams.get('name');
  const country = searchParams.get('country');
  const lang = searchParams.get('lang') || 'he';
  const unit = searchParams.get('unit') || 'metric';

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
  }

  try {
    const city = await getWeatherByCoords({
      lat: Number.parseFloat(lat),
      lon: Number.parseFloat(lon),
      name: name as string,
      country: country as string,
    });

    return NextResponse.json(city);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 500 });
  }
}
