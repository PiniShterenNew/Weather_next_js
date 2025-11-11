import { getOptimizedCurrentPosition } from '@/lib/performance-optimizations';
import { fetchSecure } from '@/lib/fetchSecure';
import { CurrentLocationData, LocationCheckResponse } from '@/types/location';
import { AppLocale } from '@/types/i18n';
import { TemporaryUnit } from '@/types/ui';

interface SaveCurrentLocationParams {
  lat: number;
  lon: number;
  cityId: string;
}

interface CheckLocationChangeParams {
  lat: number;
  lon: number;
  locale: AppLocale;
  unit: TemporaryUnit;
}

interface SendLocationChangeNotificationParams {
  oldCityName: string;
  newCityName: string;
  locale: AppLocale;
}

export const locationService = {
  async getCurrentPosition(): Promise<GeolocationPosition> {
    return getOptimizedCurrentPosition();
  },

  async saveCurrentLocation(params: SaveCurrentLocationParams): Promise<CurrentLocationData> {
    const response = await fetchSecure('/api/location/current', {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save current location');
    }

    return response.json();
  },

  async getStoredCurrentLocation(): Promise<CurrentLocationData | null> {
    const response = await fetchSecure('/api/location/current', {
      method: 'GET',
      requireAuth: true,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch stored current location');
    }

    return response.json();
  },

  async checkLocationChange(params: CheckLocationChangeParams): Promise<LocationCheckResponse> {
    const response = await fetchSecure('/api/location/check', {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to check location change');
    }

    return response.json();
  },

  async sendLocationChangeNotification(params: SendLocationChangeNotificationParams): Promise<void> {
    const response = await fetchSecure('/api/notifications/location-change', {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send location change notification');
    }
  },
};