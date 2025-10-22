/**
 * Location utilities for tracking and comparing user locations
 */

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param lat1 First latitude
 * @param lon1 First longitude
 * @param lat2 Second latitude
 * @param lon2 Second longitude
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Check if location has changed significantly
 * @param oldLat Previous latitude
 * @param oldLon Previous longitude
 * @param newLat New latitude
 * @param newLon New longitude
 * @param oldCityId Previous city ID
 * @param newCityId New city ID
 * @param thresholdKm Distance threshold in kilometers (default: 10km)
 * @returns Object indicating if location changed and the distance
 */
export function hasLocationChanged(
  oldLat: number,
  oldLon: number,
  newLat: number,
  newLon: number,
  oldCityId: string,
  newCityId: string,
  thresholdKm: number = 10
): { changed: boolean; distance: number; cityChanged: boolean } {
  // Check if city ID changed (different city)
  const cityChanged = oldCityId !== newCityId;
  
  // Calculate distance between coordinates
  const distance = calculateDistance(oldLat, oldLon, newLat, newLon);
  
  // Location changed if either city changed OR distance is greater than threshold
  const changed = cityChanged || distance > thresholdKm;
  
  return {
    changed,
    distance,
    cityChanged
  };
}

/**
 * Get current position using geolocation API
 * @param options Geolocation options
 * @returns Promise with position coordinates
 */
export function getCurrentPosition(
  options: PositionOptions = {
    enableHighAccuracy: false,
    maximumAge: 300000, // 5 minutes
    timeout: 10000 // 10 seconds
  }
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      options
    );
  });
}

/**
 * Check if geolocation is available and permission is granted
 */
export function isGeolocationAvailable(): boolean {
  return 'geolocation' in navigator && navigator.geolocation !== null;
}

/**
 * Request geolocation permission
 */
export async function requestGeolocationPermission(): Promise<PermissionState> {
  if (!('permissions' in navigator)) {
    // Fallback for browsers that don't support permissions API
    return 'prompt';
  }

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
    return permission.state;
  } catch {
    return 'prompt';
  }
}

/**
 * Format distance for display
 */
export function formatDistance(distance: number, _locale: string = 'en'): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  
  return `${Math.round(distance * 10) / 10}km`;
}

/**
 * Check if coordinates are valid
 */
export function isValidCoordinates(lat: number, lon: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    !isNaN(lat) &&
    !isNaN(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}
