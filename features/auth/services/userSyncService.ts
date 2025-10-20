/**
 * User Sync Service
 * Syncs Clerk user data with PostgreSQL database
 */

import type { UserData } from '../types';

/**
 * Sync user from Clerk to database and return preferences/cities
 */
export async function syncUserToDatabase(clerkUser: {
  id: string;
  emailAddresses: Array<{ emailAddress: string }>;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string;
}): Promise<{
  user: UserData | null;
  preferences: Record<string, unknown>;
  cities: unknown[];
} | null> {
  try {
    const response = await fetch('/api/user/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        name: clerkUser.firstName && clerkUser.lastName
          ? `${clerkUser.firstName} ${clerkUser.lastName}`
          : clerkUser.firstName || clerkUser.lastName || null,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to sync user');
    }

    const data = await response.json();
    return {
      user: data.user,
      preferences: data.preferences || {},
      cities: data.cities || [],
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error syncing user:', error);
    return null;
  }
}

/**
 * Load user preferences from database - DISABLED
 * This function is disabled to prevent duplicate API calls.
 * Preferences are now loaded via syncUserToDatabase.
 */
export async function loadUserPreferences(): Promise<{
  preferences: Record<string, unknown>;
  cities: unknown[];
} | null> {
  // eslint-disable-next-line no-console
  console.log('loadUserPreferences from auth service called but disabled to prevent duplicate API calls');
  return null;
}

/**
 * Save user preferences to database
 */
export async function saveUserPreferences(preferences: {
  locale?: string;
  theme?: string;
  unit?: string;
  cities?: unknown[];
}): Promise<boolean> {
  try {
    const response = await fetch('/api/user/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });

    return response.ok;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error saving preferences:', error);
    return false;
  }
}

