export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

import { logger } from '@/lib/errors';
import { findMatchingLimiter, getErrorMessage, getRequestIP } from '@/lib/simple-rate-limiter';

const prisma = new PrismaClient();

// Zod schema for current location
const CurrentLocationSchema = z.object({
  cityId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const ip = getRequestIP(request);
  const limiter = findMatchingLimiter('/api/location/current');
  
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

    // Get user from database or create if doesn't exist
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        currentLocation: {
          include: {
            city: true,
          },
        },
      },
    });

    if (!user) {
      // Create user if doesn't exist (with upsert to handle race conditions)
      try {
        logger.debug('Creating new user for Clerk integration');
        user = await prisma.user.create({
          data: {
            clerkId: userId,
            email: null,
            name: null,
            preferences: {},
          },
          include: {
            currentLocation: {
              include: {
                city: true,
              },
            },
          },
        });
        logger.debug('User created successfully for Clerk integration');
      } catch (error: unknown) {
        // If user already exists due to race condition, fetch it
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
          logger.debug('User already exists, fetching from database');
          user = await prisma.user.findUnique({
            where: { clerkId: userId },
            include: {
              currentLocation: {
                include: {
                  city: true,
                },
              },
            },
          });
        } else {
          throw error;
        }
      }
    }

    // Ensure user exists after creation/fetch
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.currentLocation) {
      return NextResponse.json(
        { currentLocation: null },
        { status: 200 }
      );
    }

    // Return current location with city details
    return NextResponse.json({
      currentLocation: {
        id: user.currentLocation.id,
        lat: user.currentLocation.city.lat,
        lon: user.currentLocation.city.lon,
        cityId: user.currentLocation.cityId,
        lastCheckedAt: user.currentLocation.lastCheckedAt,
        createdAt: user.currentLocation.createdAt,
        updatedAt: user.currentLocation.updatedAt,
        city: {
          id: user.currentLocation.city.id,
          lat: user.currentLocation.city.lat,
          lon: user.currentLocation.city.lon,
          cityEn: user.currentLocation.city.cityEn,
          cityHe: user.currentLocation.city.cityHe,
          countryEn: user.currentLocation.city.countryEn,
          countryHe: user.currentLocation.city.countryHe,
        },
      },
    }, { status: 200 });
  } catch (error) {
    logger.error('Get current location error', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const ip = getRequestIP(request);
  const limiter = findMatchingLimiter('/api/location/current');
  
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
    const validatedData = CurrentLocationSchema.parse(body);

    // Get user from database or create if doesn't exist
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      // Create user if doesn't exist (with upsert to handle race conditions)
      try {
        logger.debug('Creating new user for Clerk integration');
        user = await prisma.user.create({
          data: {
            clerkId: userId,
            email: null,
            name: null,
            preferences: {},
          },
        });
        logger.debug('User created successfully for Clerk integration');
      } catch (error: unknown) {
        // If user already exists due to race condition, fetch it
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
          logger.debug('User already exists, fetching from database');
          user = await prisma.user.findUnique({
            where: { clerkId: userId },
          });
        } else {
          throw error;
        }
      }
    }

    // Ensure user exists after creation/fetch
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify city exists
    const city = await prisma.city.findUnique({
      where: { id: validatedData.cityId },
    });

    if (!city) {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      );
    }

    // Upsert current location
    const currentLocation = await prisma.userCurrentLocation.upsert({
      where: { userId: user.id },
      update: {
        cityId: validatedData.cityId,
        lastCheckedAt: new Date(),
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        cityId: validatedData.cityId,
        lastCheckedAt: new Date(),
      },
      include: {
        city: true,
      },
    });

    // Return updated current location
    return NextResponse.json({
      currentLocation: {
        id: currentLocation.id,
        lat: currentLocation.city.lat,
        lon: currentLocation.city.lon,
        cityId: currentLocation.cityId,
        lastCheckedAt: currentLocation.lastCheckedAt,
        createdAt: currentLocation.createdAt,
        updatedAt: currentLocation.updatedAt,
        city: {
          id: currentLocation.city.id,
          lat: currentLocation.city.lat,
          lon: currentLocation.city.lon,
          cityEn: currentLocation.city.cityEn,
          cityHe: currentLocation.city.cityHe,
          countryEn: currentLocation.city.countryEn,
          countryHe: currentLocation.city.countryHe,
        },
      },
    }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    logger.error('Save current location error', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
