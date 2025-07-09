import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    getCachedWeather,
    setCachedWeather,
    getCacheStats,
} from '@/lib/weatherCache';
import type { CityWeather } from '@/types/weather';

const now = Date.now();

const mockWeather = (id: string, timestamp = now): CityWeather => ({
    id,
    name: { en: 'City', he: 'עיר' },
    country: { en: 'Country', he: 'מדינה' },
    lat: 0,
    lon: 0,
    lastUpdated: timestamp,
    isCurrentLocation: false,
    currentEn: {
        lat: 0,
        lon: 0,
        unit: 'metric',
        lastUpdated: timestamp,
        isCurrentLocation: false,
        current: {
            codeId: 800,
            temp: 20,
            feelsLike: 20,
            desc: 'Clear',
            icon: '01d',
            humidity: 60,
            wind: 2,
            windDeg: 180,
            pressure: 1000,
            visibility: 10000,
            clouds: 0,
            sunrise: timestamp,
            sunset: timestamp + 10000,
            timezone: 0,
        },
        forecast: [],
    },
    currentHe: {
        lat: 0,
        lon: 0,
        unit: 'metric',
        lastUpdated: timestamp,
        isCurrentLocation: false,
        current: {
            codeId: 800,
            temp: 20,
            feelsLike: 20,
            desc: 'בהיר',
            icon: '01d',
            humidity: 60,
            wind: 2,
            windDeg: 180,
            pressure: 1000,
            visibility: 10000,
            clouds: 0,
            sunrise: timestamp,
            sunset: timestamp + 10000,
            timezone: 0,
        },
        forecast: [],
    },
});

describe('weatherCache', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(now);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns null if no cache exists', () => {
        expect(getCachedWeather('missing')).toBeNull();
    });

    it('returns null if cache is expired', async () => {
        vi.setSystemTime(now - 4 * 60 * 60 * 1000);
        const stale = mockWeather('stale');
        await setCachedWeather(stale);

        vi.setSystemTime(now);
        expect(getCachedWeather('stale')).toBeNull();
    });

    it('returns data if cache is fresh', async () => {
        const fresh = mockWeather('fresh');
        await setCachedWeather(fresh);
        expect(getCachedWeather('fresh')).toEqual(fresh);
    });

    it('replaces existing cache entry', async () => {
        const first = mockWeather('city');
        const second = { ...first, name: { en: 'Updated', he: 'עודכן' } };
        await setCachedWeather(first);
        await setCachedWeather(second);
        expect(getCachedWeather('city')).toEqual(second);
    });

    it('reports correct cache stats', async () => {
        const a = mockWeather('a', now - 6000);
        const b = mockWeather('b', now - 3000);
        await setCachedWeather(a);
        await setCachedWeather(b);

        const stats = getCacheStats();
        expect(stats.size).toBeGreaterThanOrEqual(2);
        expect(stats.oldestEntry).toBeGreaterThanOrEqual(6000);
    });
});
