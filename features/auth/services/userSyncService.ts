/**
 * User Sync Service
 * Save user preferences to database
 */

import { fetchSecure } from '@/lib/fetchSecure';

export async function saveUserPreferences(preferences: {
  locale?: string;
  theme?: string;
  unit?: string;
}): Promise<boolean> {
  try {
    const response = await fetchSecure('/api/user/preferences', {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify(preferences),
    });

    return response.ok;
  } catch {
    return false;
  }
}
