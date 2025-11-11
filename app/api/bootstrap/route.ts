export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

import { logger } from '@/lib/errors';
import { getWeatherCached } from '@/lib/server/weather';
import { findMatchingLimiter, getErrorMessage, getRequestIP } from '@/lib/simple-rate-limiter';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const ip = getRequestIP(request);
  const limiter = findMatchingLimiter('/api/bootstrap');
  
  try {
    await limiter.consume(ip);
  } catch {
    const locale = request.nextUrl.pathname.includes('/en') ? 'en' : 'he';
    return NextResponse.json(
      { error: getErrorMessage(locale) },
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
        logger.debug('User created successfully for Clerk integration');
      } catch (error: unknown) {
        // If user already exists due to race condition, fetch it
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
          logger.debug('User already exists, fetching from database');
          logger.debug('User already exists, fetching from database');
          user = await prisma.user.findUnique({
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
          const cityData = {
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
            isCurrentLocation: userCity.isCurrentLocation,
            lastUpdatedUtc: new Date(weatherData.lastUpdated).toISOString(),
            current: weatherData.current,
            forecast: weatherData.forecast,
            hourly: weatherData.hourly
          };

          logger.debug('Loading city from database for bootstrap payload', { cityId: cityData.id });

          cities.push(cityData);
        }
      } catch (error) {
        logger.error(`Failed to fetch weather for city ${userCity.city.id}`, error as Error);
        // Continue with other cities even if one fails
      }
    }

    // Get server TTL
    const serverTtlMinutes = 20;

    return NextResponse.json({
      user: {
        unit,
        locale,
        lastLoginUtc: user.updatedAt.toISOString()
      },
      cities,
      currentCityId,
      serverTtlMinutes
    });

  } catch (error) {
    logger.error('Bootstrap API error', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
