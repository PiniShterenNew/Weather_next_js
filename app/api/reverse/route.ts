// src/app/api/reverse/route.ts
// GET /api/reverse?lat=32.07&lon=34.79&lang=he 

import { NextRequest, NextResponse } from 'next/server';
import { getCityInfoByCoords } from '@/lib/helpers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const lang = searchParams.get('lang') || 'he';

  if (!lat || !lon) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const cityInfo = await getCityInfoByCoords(Number.parseFloat(lat), Number.parseFloat(lon), lang);
    return NextResponse.json(cityInfo);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch ' }, { status: 500 });
  }
}
