export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { findMatchingLimiter, getErrorMessage, getRequestIP } from '@/lib/simple-rate-limiter';

const prisma = new PrismaClient();

// Zod schema for user sync
const UserSyncSchema = z.object({
  clerkId: z.string().min(1),
  email: z.string().email().optional().nullable(),
  name: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const ip = getRequestIP(request);
  const limiter = findMatchingLimiter('/api/user/sync');
  
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
    const validatedData = UserSyncSchema.parse(body);

    // Check if user matches the authenticated clerk user
    if (validatedData.clerkId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Upsert user in database
    const user = await prisma.user.upsert({
      where: { clerkId: validatedData.clerkId },
      update: {
        email: validatedData.email,
        name: validatedData.name,
        updatedAt: new Date(),
      },
      create: {
        clerkId: validatedData.clerkId,
        email: validatedData.email,
        name: validatedData.name,
      },
      include: {
        userCities: {
          include: {
            city: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });

    // Return user data along with preferences and cities to eliminate need for separate preferences call
    return NextResponse.json({ 
      user, 
      preferences: user.preferences || {},
      cities: user.userCities.map((uc) => ({
        id: uc.city.id,
        lat: uc.city.lat,
        lon: uc.city.lon,
        name: {
          en: uc.city.cityEn,
          he: uc.city.cityHe,
        },
        country: {
          en: uc.city.countryEn,
          he: uc.city.countryHe,
        },
        // Add any other fields that might be needed by the client
      })),
    }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    // eslint-disable-next-line no-console
    console.error('User sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

