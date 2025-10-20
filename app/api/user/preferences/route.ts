export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { PrismaClient, Prisma } from '@prisma/client';
import { findMatchingLimiter, getErrorMessage, getRequestIP } from '@/lib/simple-rate-limiter';

const prisma = new PrismaClient();

// Zod schema for preferences
const PreferencesSchema = z.object({
  locale: z.enum(['he', 'en']).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  unit: z.enum(['metric', 'imperial']).optional(),
  cities: z.array(z.unknown()).optional(),
  notifications: z.object({
    enabled: z.boolean().optional(),
  }).optional(),
});

// GET user preferences - DISABLED
// This endpoint is disabled to prevent duplicate API calls.
// Preferences are now loaded via /api/user/sync endpoint.
export async function GET(_request: NextRequest) {
  return NextResponse.json(
    { error: 'GET endpoint disabled - use /api/user/sync instead' },
    { status: 410 } // Gone - indicates the resource is no longer available
  );
}

// POST (save) user preferences
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const ip = getRequestIP(request);
  const limiter = findMatchingLimiter('/api/user/preferences');
  
  try {
    await limiter.consume(ip);
  } catch {
    return NextResponse.json(
      { error: getErrorMessage('en') },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  try {
    // Check authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = PreferencesSchema.parse(body);

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please sync user first.' },
        { status: 404 }
      );
    }

    // Merge existing preferences with new ones (excluding cities)
    const { cities, ...preferencesOnly } = validatedData;
    const existingPreferences = (user.preferences as Prisma.JsonObject) || {};
    const updatedPreferences = {
      ...existingPreferences,
      ...Object.fromEntries(
        Object.entries(preferencesOnly).filter(([_, v]) => v !== undefined)
      ),
    };

    // Handle cities separately - save to UserCity table
    if (cities && Array.isArray(cities)) {
      // First, delete all existing user cities
      await prisma.userCity.deleteMany({
        where: { userId: user.id },
      });

      // Then, add new cities
      for (let i = 0; i < cities.length; i++) {
        const cityData = cities[i] as {
          id: string;
          lat: number;
          lon: number;
          name: { en: string; he: string } | string;
          country: { en: string; he: string } | string;
        };
        
        // First, ensure the city exists in the City table
        const city = await prisma.city.upsert({
          where: { 
            lat_lon: {
              lat: cityData.lat,
              lon: cityData.lon,
            }
          },
          update: {
            cityEn: typeof cityData.name === 'object' ? cityData.name.en : cityData.name || '',
            cityHe: typeof cityData.name === 'object' ? cityData.name.he : cityData.name || '',
            countryEn: typeof cityData.country === 'object' ? cityData.country.en : cityData.country || '',
            countryHe: typeof cityData.country === 'object' ? cityData.country.he : cityData.country || '',
          },
          create: {
            id: cityData.id,
            lat: cityData.lat,
            lon: cityData.lon,
            cityEn: typeof cityData.name === 'object' ? cityData.name.en : cityData.name || '',
            cityHe: typeof cityData.name === 'object' ? cityData.name.he : cityData.name || '',
            countryEn: typeof cityData.country === 'object' ? cityData.country.en : cityData.country || '',
            countryHe: typeof cityData.country === 'object' ? cityData.country.he : cityData.country || '',
          },
        });

        // Then, create the UserCity relationship (use upsert to avoid unique constraint errors)
        // Since we already deleted all user cities above, this should be a create operation
        // But we'll use upsert just in case there's a race condition
        try {
          await prisma.userCity.create({
            data: {
              userId: user.id,
              cityId: city.id,
              sortOrder: i,
            },
          });
        } catch (error) {
          // If create fails due to unique constraint, update instead
          if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            await prisma.userCity.update({
              where: {
                userId_cityId: {
                  userId: user.id,
                  cityId: city.id,
                }
              },
              data: {
                sortOrder: i,
              },
            });
          } else {
            throw error;
          }
        }
      }
    }

    // Update user preferences
    user = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        preferences: updatedPreferences as Prisma.InputJsonValue,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      preferences: user.preferences,
    }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    // eslint-disable-next-line no-console
    console.error('Save preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

