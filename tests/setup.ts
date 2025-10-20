// test/setup.ts
import React from 'react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { MotionGlobalConfig } from 'framer-motion';

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
