// test/setup.ts
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
    const actual = await vi.importActual<any>('framer-motion');
    return {
        ...actual,
        AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    };
});
