import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { getAllPushSubscriptions, getUserMainCity, cleanupInvalidSubscriptions, getUserPreferences, cleanupInvalidUserSubscriptions } from '@/lib/database/pushSubscriptions';
import { createNotificationMessage, createEveningNotificationMessage, weatherToNotificationData } from '@/lib/weather/notifyFormat';

// Configure web-push
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Fixed notification times are now hardcoded: 08:00 for morning, 20:00 for evening

async function handleNotificationSend(request: NextRequest, timeOfDay: string = 'morning', forceSend: boolean = false) {
  try {
    // Clean up invalid user subscriptions first
    await cleanupInvalidUserSubscriptions();
    
    // Get all push subscriptions from database
    const subscriptions = await getAllPushSubscriptions();
    
    if (subscriptions.length === 0) {
      return NextResponse.json({ 
        success: true, 
        sent: 0,
        message: 'No subscriptions found'
      });
    }

    const invalidEndpoints: string[] = [];
    let successCount = 0;

    // Send notifications to all subscribers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sendPromises = subscriptions.map(async (subscription: any) => {
      try {
        // Get user's main city and preferences
        let city = null;
        let userPreferences: { locale: 'he' | 'en'; unit: 'celsius' | 'fahrenheit'; notifications?: { enabled?: boolean; morningTime?: string; eveningTime?: string } } = { locale: 'en', unit: 'celsius' };
        if (subscription.userId) {
          city = await getUserMainCity(subscription.userId);
          userPreferences = await getUserPreferences(subscription.userId);
          
          // Log only in development
          if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.log(`User ${subscription.userId} preferences loaded:`, JSON.stringify(userPreferences, null, 2));
          }
        }

        // Skip if no city found
        if (!city) {
          // Log only in development
          if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.log(`No city found for user ${subscription.userId}, skipping notification`);
          }
          return;
        }

        // Skip if notifications are disabled for this user
        if (userPreferences.notifications?.enabled === false) {
          // Log only in development
          if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.log(`Notifications disabled for user ${subscription.userId}, skipping notification`);
          }
          return;
        }

        // Time-based restrictions removed - notifications can be sent at any time
        // via the /api/notifications/dispatch endpoint for GitHub Actions scheduling

        // Fetch weather data for the city with appropriate units
        const unitsParam = userPreferences.unit === 'fahrenheit' ? 'imperial' : 'metric';
        const apiKey = process.env.OWM_API_KEY;
        
        if (!apiKey) {
          // Log only in development
          if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.error('OWM_API_KEY is not configured');
          }
          return;
        }
        
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}&units=${unitsParam}`
        );

        if (!weatherResponse.ok) {
          // Log only in development
          if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.error(`Failed to fetch weather for ${city.cityEn}:`, weatherResponse.status, weatherResponse.statusText);
            if (weatherResponse.status === 401) {
              // eslint-disable-next-line no-console
              console.error('Invalid OWM_API_KEY - check your .env file');
            }
          }
          return;
        }

        const weatherData = await weatherResponse.json();

        // Create notification data with user preferences
        const notificationData = weatherToNotificationData(
          weatherData,
          city.cityEn,
          userPreferences.unit,
          userPreferences.locale
        );

        // Create notification message
        const message = timeOfDay === 'morning' 
          ? createNotificationMessage(notificationData)
          : createEveningNotificationMessage(notificationData);

        // Create localized title
        const title = timeOfDay === 'morning' 
          ? (userPreferences.locale === 'he' ? 'בוקר טוב!' : 'Good Morning!')
          : (userPreferences.locale === 'he' ? 'ערב טוב!' : 'Good Evening!');

        const notificationPayload = {
          title,
          body: message,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png',
          tag: `weather-${city.cityEn.toLowerCase().replace(/\s+/g, '-')}`,
          requireInteraction: true, // FORCE NOTIFICATION TO SHOW - EVEN WHEN BROWSER IS ACTIVE
          silent: false,
          vibrate: [200, 100, 200],
          data: {
            city: city.cityEn,
            temperature: weatherData.main.temp,
            description: weatherData.weather[0]?.description || '',
            timestamp: Date.now(),
            url: '/',
            timeOfDay: timeOfDay,
            humidity: weatherData.main.humidity,
            windSpeed: weatherData.wind?.speed || 0,
            pressure: weatherData.main.pressure,
            iconCode: weatherData.weather[0]?.icon || '01d',
          },
        };

        // Log only in development
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.log('Sending notification payload:', JSON.stringify(notificationPayload, null, 2));
        }

        // Send notification
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          JSON.stringify(notificationPayload)
        );

        successCount++;
        // Log only in development
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.log(`Notification sent to ${subscription.endpoint} for ${city.cityEn}`);
        }

      } catch (error) {
        // Log only in development
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.error('Error sending notification:', error);
        }
        
        // Check if it's an invalid subscription error - handle WebPushError with statusCode
        if (error instanceof Error) {
          const errorMessage = error.message.toLowerCase();
          const hasErrorCode410 = errorMessage.includes('410') || 
                                  errorMessage.includes('gone') ||
                                  errorMessage.includes('unexpected response code') ||
                                  (error as { statusCode?: number }).statusCode === 410;
          
          if (hasErrorCode410) {
            // Log only in development
            if (process.env.NODE_ENV !== 'production') {
              // eslint-disable-next-line no-console
              console.log(`Adding invalid endpoint to cleanup list: ${subscription.endpoint.substring(0, 50)}...`);
            }
            invalidEndpoints.push(subscription.endpoint);
          }
        }
      }
    });

    await Promise.allSettled(sendPromises);

    // Clean up invalid subscriptions
    if (invalidEndpoints.length > 0) {
      await cleanupInvalidSubscriptions(invalidEndpoints);
    }

    return NextResponse.json({ 
      success: true, 
      sent: successCount,
      total: subscriptions.length,
      invalid: invalidEndpoints.length
    });
  } catch (error) {
    // Log only in development
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('Error sending push notifications:', error);
    }
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const timeOfDay = searchParams.get('timeOfDay') || 'morning';
  const forceSend = searchParams.get('force') === 'true';
  
  // Determine time of day based on current hour if not specified
  let finalTimeOfDay = timeOfDay;
  if (timeOfDay === 'auto') {
    const now = new Date();
    const hour = now.getHours();
    finalTimeOfDay = hour >= 12 ? 'evening' : 'morning';
  }
  
  return handleNotificationSend(request, finalTimeOfDay, forceSend);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { timeOfDay = 'morning', forceSend = false } = body;
    return handleNotificationSend(request, timeOfDay, forceSend);
  } catch {
    // If JSON parsing fails, default to morning
    return handleNotificationSend(request, 'morning', false);
  }
}
