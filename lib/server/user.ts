/**
 * Server-side user functions
 * Handles user data fetching from database
 */

import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export interface UserWithCities {
  id: string;
  clerkId: string;
  email: string | null;
  name: string | null;
  preferences: {
    locale?: string;
    theme?: string;
    unit?: string;
  } | null;
  userCities: Array<{
    sortOrder: number;
    city: {
      id: string;
      lat: number;
      lon: number;
      cityEn: string;
      cityHe: string;
      countryEn: string;
      countryHe: string;
    };
  }>;
}

/**
 * Get current user with cities from database
 * @returns User data with cities or null if not authenticated
 */
export async function getCurrentUserWithCities(): Promise<UserWithCities | null> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        userCities: {
          include: {
            city: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        }
      }
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      name: user.name,
      preferences: user.preferences as { locale?: string; theme?: string; unit?: string } | null,
      userCities: user.userCities.map(uc => ({
        sortOrder: uc.sortOrder,
        city: {
          id: uc.city.id,
          lat: uc.city.lat,
          lon: uc.city.lon,
          cityEn: uc.city.cityEn,
          cityHe: uc.city.cityHe,
          countryEn: uc.city.countryEn,
          countryHe: uc.city.countryHe
        }
      }))
    };
  } catch {
    // console.error('Error fetching user data:', error);
    return null;
  }
}

/**
 * Save user preferences to database
 * @param preferences - User preferences to save
 * @returns Success status
 */
export async function saveUserPreferences(preferences: {
  locale?: string;
  theme?: string;
  unit?: string;
}): Promise<boolean> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return false;
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return false;
    }

    // Merge with existing preferences
    const existingPreferences = (user.preferences as { locale?: string; theme?: string; unit?: string } | null) || {};
    const updatedPreferences = {
      ...existingPreferences,
      ...Object.fromEntries(
        Object.entries(preferences).filter(([_, v]) => v !== undefined)
      )
    };

    await prisma.user.update({
      where: { clerkId: userId },
      data: {
        preferences: updatedPreferences,
        updatedAt: new Date()
      }
    });

    return true;
  } catch {
    // console.error('Error saving user preferences:', error);
    return false;
  }
}
