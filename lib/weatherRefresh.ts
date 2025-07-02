import type { City } from '@/types/weather';

const THREE_HOURS_MS = 3 * 60 * 60 * 1000; // 3 hours
const REFRESH_THROTTLE_MS = 1 * 60 * 1000; // 1 minutes

const lastRefreshMap = new Map<string, number>();

export function isCityDataStale(city: City): boolean {
    const now = Date.now();
    return (
      !city?.lastUpdated ||
      now - city.lastUpdated > THREE_HOURS_MS
    );
  }
  
  export function canRefreshCity(cityId: string): boolean {
    const now = Date.now();
    const last = lastRefreshMap.get(cityId) ?? 0;
    if (now - last < REFRESH_THROTTLE_MS) return false;
    lastRefreshMap.set(cityId, now);
    return true;
  }
  
  export function shouldAutoRefresh(
    city: City,
  ): boolean {
    return isCityDataStale(city) && canRefreshCity(city.id);
  }