import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PushSubscriptionData {
  userId?: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

/**
 * Save or update a push subscription
 */
export async function savePushSubscription(data: PushSubscriptionData) {
  try {
    const subscription = await prisma.pushSubscription.upsert({
      where: {
        endpoint: data.endpoint,
      },
      update: {
        userId: data.userId,
        p256dh: data.p256dh,
        auth: data.auth,
        updatedAt: new Date(),
      },
      create: {
        userId: data.userId,
        endpoint: data.endpoint,
        p256dh: data.p256dh,
        auth: data.auth,
      },
    });

    return subscription;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error saving push subscription:', error);
    throw error;
  }
}

/**
 * Remove a push subscription by endpoint
 */
export async function removePushSubscription(endpoint: string) {
  try {
    const result = await prisma.pushSubscription.delete({
      where: {
        endpoint,
      },
    });

    return result;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error removing push subscription:', error);
    throw error;
  }
}

/**
 * Get all push subscriptions
 */
export async function getAllPushSubscriptions() {
  try {
    const subscriptions = await prisma.pushSubscription.findMany();

    return subscriptions;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error getting push subscriptions:', error);
    throw error;
  }
}

/**
 * Get push subscriptions for a specific user
 */
export async function getUserPushSubscriptions(userId: string) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId,
      },
    });

    return subscriptions;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error getting user push subscriptions:', error);
    throw error;
  }
}

/**
 * Get database user ID from Clerk user ID
 */
async function getDatabaseUserId(clerkUserId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        clerkId: clerkUserId,
      },
      select: {
        id: true,
      },
    });

    return user?.id || null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error getting database user ID:', error);
    throw error;
  }
}

/**
 * Get user's main city for notifications
 * Accepts either Clerk user ID or database user ID
 */
export async function getUserMainCity(userId: string) {
  try {

    // Check if this is a Clerk user ID (starts with 'user_' or similar Clerk pattern)
    // If not found in UserCity with this ID, try to find by clerkId
    const userCity = await prisma.userCity.findFirst({
      where: {
        userId,
      },
      orderBy: {
        sortOrder: 'asc',
      },
      include: {
        city: true,
      },
    });

    if (userCity) {
      return userCity.city;
    }

    // If not found, try to convert from Clerk ID to database ID
    const convertedUserId = await getDatabaseUserId(userId);
    if (convertedUserId) {
      const userCityByDbId = await prisma.userCity.findFirst({
        where: {
          userId: convertedUserId,
        },
        orderBy: {
          sortOrder: 'asc',
        },
        include: {
          city: true,
        },
      });

      return userCityByDbId?.city || null;
    }

    return null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error getting user main city:', error);
    throw error;
  }
}

/**
 * Get user preferences by any user ID (Clerk ID or database ID)
 */
export async function getUserPreferences(userId: string): Promise<{ locale: 'he' | 'en'; unit: 'celsius' | 'fahrenheit'; notifications?: { enabled?: boolean; morningTime?: string; eveningTime?: string } }> {
  try {
    // First try to find by clerkId (Clerk user ID)
    let user = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
      select: {
        preferences: true,
      },
    });

    // If not found, try to find by database ID
    if (!user) {
      user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          preferences: true,
        },
      });
    }

    if (!user?.preferences) {
      return { locale: 'en', unit: 'celsius' };
    }

    const preferences = user.preferences as {
      locale?: string;
      unit?: string;
      notifications?: {
        enabled?: boolean;
        morningTime?: string;
        eveningTime?: string;
      };
    };
    
    const result = {
      locale: (preferences.locale === 'he' ? 'he' : 'en') as 'he' | 'en',
      unit: (preferences.unit === 'imperial' ? 'fahrenheit' : 'celsius') as 'celsius' | 'fahrenheit',
      notifications: preferences.notifications || { enabled: false, morningTime: '07:30', eveningTime: '19:30' },
    };
    
    return result;
  } catch (error) {
    // Only log in development
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('Error getting user preferences:', error);
    }
    return { locale: 'en', unit: 'celsius' };
  }
}

/**
 * Clean up invalid push subscriptions
 */
export async function cleanupInvalidSubscriptions(invalidEndpoints: string[]) {
  try {
    const result = await prisma.pushSubscription.deleteMany({
      where: {
        endpoint: {
          in: invalidEndpoints,
        },
      },
    });

    // Log only in development
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(`Cleaned up ${result.count} invalid push subscriptions`);
    }
    return result;
  } catch (error) {
    // Log only in development
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('Error cleaning up invalid subscriptions:', error);
    }
    throw error;
  }
}

/**
 * Clean up subscriptions with invalid user IDs (like 'current-user-id')
 */
export async function cleanupInvalidUserSubscriptions() {
  try {
    const result = await prisma.pushSubscription.deleteMany({
      where: {
        userId: 'current-user-id',
      },
    });

    // Log only in development
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(`Cleaned up ${result.count} subscriptions with invalid user IDs`);
    }
    return result;
  } catch (error) {
    // Log only in development
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('Error cleaning up invalid user subscriptions:', error);
    }
    throw error;
  }
}
