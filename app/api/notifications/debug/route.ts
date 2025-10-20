import { NextRequest, NextResponse } from 'next/server';
import { getAllPushSubscriptions } from '@/lib/database/pushSubscriptions';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(_request: NextRequest) {
  try {
    // Get all push subscriptions
    const subscriptions = await getAllPushSubscriptions();
    
    // Get all users with their preferences
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        preferences: true,
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

    const debugInfo = {
      summary: {
        totalSubscriptions: subscriptions.length,
        totalUsers: allUsers.length,
        usersWithCities: allUsers.filter(u => u.userCities.length > 0).length,
        usersWithNotificationPreferences: allUsers.filter(u => {
          const prefs = u.preferences as {
            notifications?: { enabled?: boolean };
          };
          return prefs?.notifications?.enabled === true;
        }).length
      },
      subscriptions: subscriptions.map(sub => ({
        id: sub.id,
        userId: sub.userId,
        endpoint: sub.endpoint.substr(0, 50) + '...' // Truncate for privacy
      })),
      users: allUsers.map(user => {
        const preferences = user.preferences as {
          locale?: string;
          theme?: string;
          unit?: string;
          notifications?: {
            enabled?: boolean;
            morningTime?: string;
            eveningTime?: string;
          };
        };
        const notificationPrefs = preferences?.notifications || {};
        
        return {
          id: user.id,
          clerkId: user.clerkId,
          email: user.email,
          name: user.name,
          hasCities: user.userCities.length > 0,
          citiesCount: user.userCities.length,
          cities: user.userCities.map(uc => ({
            name: uc.city.cityEn,
            lat: uc.city.lat,
            lon: uc.city.lon
          })),
          notificationSettings: {
            enabled: notificationPrefs.enabled || false,
            morningTime: notificationPrefs.morningTime || '07:30',
            eveningTime: notificationPrefs.eveningTime || '19:30'
          },
          generalPreferences: {
            locale: preferences?.locale || 'en',
            theme: preferences?.theme || 'system',
            unit: preferences?.unit || 'metric'
          }
        };
      }),
      notificationsAnalysis: allUsers.map(user => {
        const preferences = user.preferences as {
          notifications?: {
            enabled?: boolean;
            morningTime?: string;
            eveningTime?: string;
          };
        };
        const notificationPrefs = preferences?.notifications || {};
        
        // Find user's subscription
        const userSubscription = subscriptions.find(sub => sub.userId === user.clerkId || sub.userId === user.id);
        
        return {
          userId: user.id,
          clerkId: user.clerkId,
          email: user.email,
          wouldReceiveNotification: {
            hasSubscription: !!userSubscription,
            hasCities: user.userCities.length > 0,
            notificationsEnabled: notificationPrefs.enabled === true,
            canReceive: !!userSubscription && 
                       user.userCities.length > 0 && 
                       notificationPrefs.enabled === true
          },
          issues: [
            ...(userSubscription ? [] : ['No push subscription']),
            ...(user.userCities.length === 0 ? ['No cities added'] : []),
            ...(notificationPrefs.enabled !== true ? ['Notifications disabled'] : [])
          ]
        };
      })
    };

    return NextResponse.json(debugInfo, { status: 200 });

  } catch (error) {
    // Log only in development
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('Error in debug endpoint:', error);
    }
    return NextResponse.json(
      { error: 'Failed to get debug information' },
      { status: 500 }
    );
  }
}
