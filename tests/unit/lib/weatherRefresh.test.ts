import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isCityDataStale, canRefreshCity, shouldAutoRefresh } from '@/lib/weatherRefresh';
import { existingCity } from '@/tests/fixtures/existingCity';
import { CityWeather } from '@/types/weather';

describe('weatherRefresh utilities', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(Date.now());
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('isCityDataStale', () => {
        it('returns false if lastUpdated is recent', () => {
            expect(isCityDataStale(existingCity)).toBe(false);
        });

        it('returns true if lastUpdated is more than 3 hours ago', () => {
            const oldCity = { ...existingCity, lastUpdated: Date.now() - 4 * 60 * 60 * 1000 };
            expect(isCityDataStale(oldCity)).toBe(true);
        });

        it('returns true if lastUpdated is missing', () => {
            const cityWithoutUpdate = { ...existingCity } as Partial<CityWeather>;
            delete cityWithoutUpdate.lastUpdated;
            expect(isCityDataStale(cityWithoutUpdate as CityWeather)).toBe(true);
        });
    });

    describe('canRefreshCity', () => {
        it('returns true for a new city (no previous refresh)', () => {
            expect(canRefreshCity('new-city')).toBe(true);
        });

        it('returns false if refresh was done less than 1 minute ago', () => {
            const cityId = 'test-city';
            expect(canRefreshCity(cityId)).toBe(true);
            expect(canRefreshCity(cityId)).toBe(false);
        });

        it('returns true after 1 minute has passed', () => {
            const cityId = 'delayed-city';
            expect(canRefreshCity(cityId)).toBe(true);
            vi.advanceTimersByTime(60 * 1000);
            expect(canRefreshCity(cityId)).toBe(true);
        });
    });

    describe('shouldAutoRefresh', () => {
        it('returns true only if data is stale and refresh is allowed', () => {
            const city = { ...existingCity, lastUpdated: Date.now() - 4 * 60 * 60 * 1000 };
            expect(shouldAutoRefresh(city)).toBe(true);
        });

        it('returns false if data is fresh', () => {
            expect(shouldAutoRefresh(existingCity)).toBe(false);
        });

        it('returns false if refresh is throttled', () => {
            const city = { ...existingCity, lastUpdated: Date.now() - 4 * 60 * 60 * 1000 };
            shouldAutoRefresh(city);
            expect(shouldAutoRefresh(city)).toBe(false);
        });
    });
});