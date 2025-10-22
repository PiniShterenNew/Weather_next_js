/**
 * User Sync Service
 * Save user preferences to database
 */

/**
 * Save user preferences to database
 */
export async function saveUserPreferences(preferences: {
  locale?: string;
  theme?: string;
  unit?: string;
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
