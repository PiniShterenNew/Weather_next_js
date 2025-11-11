export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { PrismaClient, Prisma } from '@prisma/client';

import { logger } from '@/lib/errors';
import { findCityById, saveCityToDatabase } from '@/lib/db/suggestion';
import { getLocationForDB } from '@/lib/helpers';
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
    logger.warn('Rate limit exceeded for /api/user/preferences');
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
      // Create user if doesn't exist (with upsert to handle race conditions)
      try {
        logger.debug('Creating new user in database for Clerk integration');
        user = await prisma.user.create({
          data: {
            clerkId: userId,
            email: null, // Will be updated from Clerk if needed
            name: null,  // Will be updated from Clerk if needed
            preferences: {},
          },
        });
        logger.debug('User created successfully for Clerk integration');
      } catch (error: unknown) {
        // If user already exists due to race condition, fetch it
        if (error && typeof error === 'object' && 'code' in error && (error as { code?: string }).code === 'P2002') {
          logger.debug('User already exists, fetching from database');
          user = await prisma.user.findUnique({
            where: { clerkId: userId },
          });
        } else {
          throw error;
        }
      }
    }

    // Narrow type after creation/fetch
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
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
          name?: { en: string; he: string } | string;
          country?: { en: string; he: string } | string;
          isCurrentLocation?: boolean;
        };

        // Ensure city exists with canonical bilingual data
        let ensured = await findCityById(cityData.id);
        if (!ensured) {
          // Resolve bilingual names from Geoapify (server-side) and save once
          const canonical = await getLocationForDB(cityData.lat, cityData.lon);
          ensured = await saveCityToDatabase(canonical);
        }

        // Create the UserCity relationship
        // Since we already deleted all user cities above, this should be a create operation
        // But we'll use upsert just in case there's a race condition
        try {
          await prisma.userCity.create({
            data: {
              userId: user.id,
              cityId: ensured.id,
              sortOrder: i,
              isCurrentLocation: cityData.isCurrentLocation || false,
            },
          });
        } catch (error) {
          // If create fails due to unique constraint, update instead
          if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            await prisma.userCity.update({
              where: {
                userId_cityId: {
                  userId: user.id,
                  cityId: ensured.id,
                }
              },
              data: {
                sortOrder: i,
                isCurrentLocation: cityData.isCurrentLocation || false,
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

    logger.error('Save preferences error', error as Error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

