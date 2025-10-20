import { WeatherCacheStore } from '@/types/cache';
import { CityWeather } from '@/types/weather';

/**
 * Time constants for cache management
 */
const THREE_HOURS_IN_MS = 3 * 60 * 60 * 1000;
const ONE_HOUR_IN_MS = 60 * 60 * 1000; // Faster refresh for better UX
const MAX_CACHE_SIZE = 150; // Increased cache size
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000; // More frequent cleanup

/**
 * In-memory storage for weather cache
 */
const weatherCache: WeatherCacheStore = {};
let lastCleanupTime = Date.now();

/**
 * Cleans up the weather cache by removing expired entries and limiting cache size.
 * This function performs two main tasks:
 * 1. Removes entries older than 3 hours
 * 2. If cache exceeds maximum size, removes oldest entries first
 * 
 * To avoid excessive processing, cleanup only runs every 15 minutes.
 */
function cleanupCache(): void {
  const now = Date.now();

  // Only clean if 15 minutes have passed since last cleanup
  if (now - lastCleanupTime < CLEANUP_INTERVAL_MS) {
    return;
  }

  lastCleanupTime = now;

  // Remove expired entries (older than 3 hours, but prefer 1 hour for better UX)
  Object.keys(weatherCache).forEach(id => {
    const entry = weatherCache[id];
    const age = now - entry.timestamp;
    // Remove entries older than 3 hours, or 1 hour if cache is getting full
    const shouldRemove = age > THREE_HOURS_IN_MS || 
                        (Object.keys(weatherCache).length > MAX_CACHE_SIZE * 0.8 && age > ONE_HOUR_IN_MS);
    if (shouldRemove) {
      delete weatherCache[id];
    }
  });

  // Limit cache size
  const ids = Object.keys(weatherCache);
  if (ids.length > MAX_CACHE_SIZE) {
    // Sort by timestamp (oldest first)
    const sortedIds = ids.sort((a, b) => weatherCache[a].timestamp - weatherCache[b].timestamp);

    // Remove oldest entries
    const idsToRemove = sortedIds.slice(0, ids.length - MAX_CACHE_SIZE);
    idsToRemove.forEach(id => {
      delete weatherCache[id];
    });
  }
}

/**
 * Returns the cached weather data for a city if it's fresh (within 3 hours).
 * Triggers cache cleanup on each access.
 * 
 * @param id - The city ID to look up in the cache
 * @returns The cached weather data if fresh, otherwise null
 */
export function getCachedWeather(id: string): CityWeather | null {
  cleanupCache();

  const entry = weatherCache[id];
  if (!entry) return null;

  const age = Date.now() - entry.timestamp;
  // Consider fresh if less than 3 hours
  const isFresh = age < THREE_HOURS_IN_MS;
  
  // Return data if fresh
  if (isFresh) {
    return entry.data;
  }
  return null;
}

/**
 * Saves weather data to the in-memory cache.
 * Triggers cache cleanup after saving.
 * 
 * @param data - The weather data to cache
 */
export async function setCachedWeather(data: CityWeather): Promise<void> {
  weatherCache[data.id] = {
    data,
    timestamp: Date.now(),
  };
  cleanupCache();
}

/**
 * Returns statistics about the current state of the weather cache.
 * Useful for monitoring and debugging.
 * 
 * @returns Object containing cache size and age of oldest entry in milliseconds
 */
export function getCacheStats(): { size: number, oldestEntry: number | null } {
  const ids = Object.keys(weatherCache);
  const timestamps = ids.map(id => weatherCache[id].timestamp);
  const oldestTimestamp = timestamps.length > 0 ? Math.min(...timestamps) : null;

  return {
    size: ids.length,
    oldestEntry: oldestTimestamp ? Date.now() - oldestTimestamp : null
  };
}
