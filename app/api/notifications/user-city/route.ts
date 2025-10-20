import { NextRequest, NextResponse } from 'next/server';
import { getUserMainCity } from '@/lib/database/pushSubscriptions';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const city = await getUserMainCity(userId);

    if (!city) {
      return NextResponse.json({
        success: false,
        message: 'No cities found for user',
      });
    }

    return NextResponse.json({
      success: true,
      city: {
        name: city.cityEn,
        nameHe: city.cityHe,
        country: city.countryEn,
        countryHe: city.countryHe,
        lat: city.lat,
        lon: city.lon,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error getting user city:', error);
    return NextResponse.json(
      { error: 'Failed to get user city' },
      { status: 500 }
    );
  }
}
