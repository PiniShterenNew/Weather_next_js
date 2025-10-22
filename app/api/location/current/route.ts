export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { findMatchingLimiter, getErrorMessage, getRequestIP } from '@/lib/simple-rate-limiter';

const prisma = new PrismaClient();

// Zod schema for current location
const CurrentLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
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

    // Get user from database
    const user = await prisma.user.findUnique({
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
        lat: user.currentLocation.lat,
        lon: user.currentLocation.lon,
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
    // eslint-disable-next-line no-console
    console.error('Get current location error:', error);
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

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

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
        lat: validatedData.lat,
        lon: validatedData.lon,
        lastCheckedAt: new Date(),
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        cityId: validatedData.cityId,
        lat: validatedData.lat,
        lon: validatedData.lon,
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
        lat: currentLocation.lat,
        lon: currentLocation.lon,
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

    // eslint-disable-next-line no-console
    console.error('Save current location error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
