// test/setup.ts
import React from 'react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { MotionGlobalConfig } from 'framer-motion';
import type { FullCityEntryServer } from '@/types/cache';

if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = vi.fn();
}
if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = vi.fn();
}
if (!globalThis.matchMedia) {
    globalThis.matchMedia = function (query) {
        return {
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn()
        };
    };
}

Object.defineProperty(globalThis, 'window', {
    value: globalThis,
    configurable: true,
    writable: true,
});

MotionGlobalConfig.skipAnimations = true;

vi.mock('framer-motion', async () => {
    const actual = await vi.importActual<Record<string, unknown>>('framer-motion');
    return {
        ...actual,
        AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    };
});

// Mock next/navigation (single mock to avoid duplication)
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
        prefetch: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
    redirect: vi.fn(),
    notFound: vi.fn(),
}));

// Mock next/navigation.js (for next-intl compatibility)
vi.mock('next/navigation.js', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
        prefetch: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
}));

// Mock next-intl navigation specifically
vi.mock('next-intl/navigation', () => ({
    createNavigation: () => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Link: ({ children, ...props }: any) => React.createElement('a', props, children),
        redirect: vi.fn(),
        usePathname: () => '/',
        useRouter: () => ({
            push: vi.fn(),
            replace: vi.fn(),
            back: vi.fn(),
            forward: vi.fn(),
            refresh: vi.fn(),
            prefetch: vi.fn(),
        }),
        getPathname: () => '/',
    }),
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
        prefetch: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
}));

// Mock next-intl to prevent navigation import issues
vi.mock('next-intl', async () => {
    const actual = await vi.importActual<typeof import('next-intl')>('next-intl');
    return {
        ...actual,
        useRouter: () => ({
            push: vi.fn(),
            replace: vi.fn(),
            back: vi.fn(),
            forward: vi.fn(),
            refresh: vi.fn(),
            prefetch: vi.fn(),
        }),
        usePathname: () => '/',
        useSearchParams: () => new URLSearchParams(),
        useParams: () => ({}),
    };
});

vi.mock('@clerk/nextjs', () => ({
    getToken: vi.fn().mockResolvedValue('test-token'),
}));

vi.mock('@clerk/nextjs/server', () => ({
    auth: vi.fn().mockResolvedValue({
        userId: 'test-user',
        getToken: vi.fn().mockResolvedValue('test-token'),
    }),
}));

const baseCities: FullCityEntryServer[] = [
    {
        id: 'city:32.0853_34.7818',
        lat: 32.0853,
        lon: 34.7818,
        city: { en: 'Tel Aviv', he: 'תל אביב' },
        country: { en: 'Israel', he: 'ישראל' },
    },
    {
        id: 'city:51.5074_-0.1278',
        lat: 51.5074,
        lon: -0.1278,
        city: { en: 'London', he: 'לונדון' },
        country: { en: 'United Kingdom', he: 'בריטניה' },
    },
    {
        id: 'city:48.8566_2.3522',
        lat: 48.8566,
        lon: 2.3522,
        city: { en: 'Paris', he: 'פריז' },
        country: { en: 'France', he: 'צרפת' },
    },
    {
        id: 'city:-6.1659_39.2026',
        lat: -6.1659,
        lon: 39.2026,
        city: { en: 'Zanzibar', he: 'זנזיבר' },
        country: { en: 'Tanzania', he: 'טנזניה' },
    },
    {
        id: 'city:64.1466_-21.9426',
        lat: 64.1466,
        lon: -21.9426,
        city: { en: 'Reykjavik', he: 'רייקיאוויק' },
        country: { en: 'Iceland', he: 'איסלנד' },
    },
    {
        id: 'city:27.7172_85.324',
        lat: 27.7172,
        lon: 85.324,
        city: { en: 'Kathmandu', he: 'קטמנדו' },
        country: { en: 'Nepal', he: 'נפאל' },
    },
    {
        id: 'city:50.0755_14.4378',
        lat: 50.0755,
        lon: 14.4378,
        city: { en: 'Prague', he: 'פראג' },
        country: { en: 'Czech Republic', he: 'צ\'כיה' },
    },
];

vi.mock('@/lib/db/suggestion', () => {
    const savedCities: FullCityEntryServer[] = [...baseCities];
    const dbExcludeQueries = new Set(['zanzibar', 'זנזיבר', 'reykjavik']);

    const matchQuery = (entry: FullCityEntryServer, query: string) => {
        const lower = query.toLowerCase();
        return (
            entry.city.en.toLowerCase().includes(lower) ||
            entry.city.he.includes(query) ||
            entry.country.en.toLowerCase().includes(lower) ||
            entry.country.he.includes(query)
        );
    };

    return {
        findCityById: vi.fn(async (id: string) => savedCities.find((city) => city.id === id) ?? null),
        findCitiesByQuery: vi.fn(async (query: string) => {
            const trimmed = query.trim();
            if (!trimmed) {
                return [];
            }
            const lower = trimmed.toLowerCase();
            if (dbExcludeQueries.has(lower) || dbExcludeQueries.has(trimmed)) {
                return [];
            }
            return savedCities.filter((city) => matchQuery(city, trimmed)).slice(0, 5);
        }),
        saveCityToDatabase: vi.fn(async (city: { id: string; lat: number; lon: number; city: { en: string; he: string }; country: { en: string; he: string } }) => {
            const normalized: FullCityEntryServer = {
                id: city.id,
                lat: city.lat,
                lon: city.lon,
                city: { ...city.city },
                country: { ...city.country },
            };
            const existingIndex = savedCities.findIndex((entry) => entry.id === normalized.id);
            if (existingIndex >= 0) {
                savedCities[existingIndex] = normalized;
            } else {
                savedCities.push(normalized);
            }
            return normalized;
        }),
    };
});

vi.mock('@/lib/helpers', async () => {
    const actual = await vi.importActual<typeof import('@/lib/helpers')>('@/lib/helpers');

    const getMatchingCities = (query: string) => {
        const trimmed = query.trim();
        if (!trimmed) {
            return [];
        }
        const lower = trimmed.toLowerCase();
        return baseCities.filter(
            (entry) =>
                entry.city.en.toLowerCase().includes(lower) ||
                entry.city.he.includes(trimmed) ||
                entry.country.en.toLowerCase().includes(lower) ||
                entry.country.he.includes(trimmed),
        );
    };

    return {
        ...actual,
        getSuggestionsForDB: vi.fn(async (query: string, _lang: 'he' | 'en' = 'he') => getMatchingCities(query)),
        getLocationForDB: vi.fn(async (lat: number, lon: number) => {
            const match = baseCities.find((entry) => Math.abs(entry.lat - lat) < 0.5 && Math.abs(entry.lon - lon) < 0.5);
            return match ?? baseCities[0];
        }),
    };
});

// Mock useLocationRefresh hook
vi.mock('@/features/location/hooks/useLocationRefresh', () => ({
    useLocationRefresh: () => ({
        isRefreshingLocation: false,
        handleRefreshLocation: vi.fn(),
    }),
}));

// Silence specific, known noisy warnings in tests (Radix Dialog a11y guidance and React act())
const originalError = console.error;
const originalWarn = console.warn;
const noisyPatterns = [
    /DialogContent.*requires a `DialogTitle`/i,
    /Missing `Description`.*aria-describedby/i,
    /not wrapped in act\(.*\)/i,
];
console.error = (...args: unknown[]) => {
    const msg = (args[0] as string) ?? '';
    if (typeof msg === 'string' && noisyPatterns.some((p) => p.test(msg))) {
        return;
    }
    // @ts-expect-error pass-through
    originalError(...args);
};
console.warn = (...args: unknown[]) => {
    const msg = (args[0] as string) ?? '';
    if (typeof msg === 'string' && noisyPatterns.some((p) => p.test(msg))) {
        return;
    }
    // @ts-expect-error pass-through
    originalWarn(...args);
};