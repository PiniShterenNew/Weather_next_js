/**
 * Server-side bootstrap functions
 * Handles initial data loading for SSR
 */

import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { getWeatherCached } from '@/lib/server/weather';

const prisma = new PrismaClient();

export interface BootstrapData {
  user: {
    unit: 'metric' | 'imperial';
    locale: 'he' | 'en';
    lastLoginUtc: string;
  };
  cities: Array<{
    id: string;
    name: { en: string; he: string };
    country: { en: string; he: string };
    lat: number;
    lon: number;
    isCurrentLocation: boolean;
    lastUpdatedUtc: string;
    current: unknown;
    forecast: unknown[];
    hourly: unknown[];
  }>;
  currentCityId: string | null;
  serverTtlMinutes: number;
}

/**
 * Load initial bootstrap data for SSR
 * @returns Bootstrap data or null if user not authenticated
 */
export async function loadBootstrapData(): Promise<BootstrapData | null> {
  try {
    // Check authentication
    const { userId } = await auth();
    
    if (!userId) {
      return null;
    }

    // Get user from database
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
        },
        currentLocation: {
          include: {
            city: true
          }
        }
      }
    });

    if (!user) {
      return null;
    }

    // Get user preferences
    const preferences = (user.preferences as {
      unit?: 'metric' | 'imperial';
      locale?: 'he' | 'en';
      theme?: 'light' | 'dark' | 'system';
    }) || {};

    const unit = preferences.unit || 'metric';
    const locale = preferences.locale || 'he';

    // Get current city ID (first city or current location)
    let currentCityId: string | null = null;
    if (user.currentLocation) {
      currentCityId = user.currentLocation.cityId;
    } else if (user.userCities.length > 0) {
      currentCityId = user.userCities[0].cityId;
    }

    // Fetch weather data for all cities
    const cities = [];
    for (const userCity of user.userCities) {
      try {
        const weatherData = await getWeatherCached(
          userCity.city.id,
          userCity.city.lat,
          userCity.city.lon,
          locale
        );

        if (weatherData) {
          cities.push({
            id: userCity.city.id,
            name: {
              en: userCity.city.cityEn,
              he: userCity.city.cityHe
            },
            country: {
              en: userCity.city.countryEn,
              he: userCity.city.countryHe
            },
            lat: userCity.city.lat,
            lon: userCity.city.lon,
            isCurrentLocation: userCity.city.id === user.currentLocation?.cityId,
            lastUpdatedUtc: new Date(weatherData.lastUpdated).toISOString(),
            current: weatherData.current,
            forecast: weatherData.forecast,
            hourly: weatherData.hourly
          });
        }
      } catch {
        // Continue with other cities even if one fails
      }
    }

    return {
      user: {
        unit,
        locale,
        lastLoginUtc: user.updatedAt.toISOString()
      },
      cities,
      currentCityId,
      serverTtlMinutes: 20
    };

  } catch {
    return null;
  }
}
