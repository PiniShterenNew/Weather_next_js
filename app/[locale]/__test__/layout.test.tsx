import { describe, it, expect, vi, beforeEach } from 'vitest';
import LocaleLayout, { generateStaticParams } from '../layout';
import { AppLocale } from '@/types/i18n';
import * as nextNavigation from 'next/navigation';
import * as nextIntlServer from 'next-intl/server';
import { renderToString } from 'react-dom/server';

// Mock the modules
vi.mock('next/navigation', () => ({
    notFound: vi.fn(),
}));

vi.mock('next-intl/server', () => ({
    setRequestLocale: vi.fn(),
}));

vi.mock('@/styles/fonts', () => ({
    notoSans: { variable: 'font-noto-sans' },
}));

vi.mock('@/components/LoadingOverlay', () => ({
    default: () => <div data-testid="loading-overlay">Loading Overlay</div>,
}));

vi.mock('@/components/Toast/ToastHost', () => ({
    default: () => <div data-testid="toast-host">Toast Host</div>,
}));

vi.mock('@/providers/ThemeAndDirectionProvider', () => ({
    ThemeAndDirectionProvider: ({ children, locale }: { children: React.ReactNode, locale: string }) => (
        <div data-testid="theme-provider" data-locale={locale}>{children}</div>
    ),
}));

vi.mock('@radix-ui/react-tooltip', () => ({
    __esModule: true,
    TooltipProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="tooltip-provider-direct">{children}</div>
    ),
    Provider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="tooltip-provider-primitive">{children}</div>
    ),
    Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Trigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
    Content: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('LocaleLayout', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the layout with English locale', async () => {
        const params = Promise.resolve({ locale: 'en' as AppLocale });

        const result = await LocaleLayout({
            children: <div data-testid="child-component">Child Component</div>,
            params,
        });

        const html = renderToString(result);

        expect(html).toContain('Child Component');
        expect(html).toContain('lang="en"');
        expect(html).toContain('dir="ltr"');
        expect(nextIntlServer.setRequestLocale).toHaveBeenCalledWith('en');
    });

    it('renders the layout with Hebrew locale and RTL direction', async () => {
        const params = Promise.resolve({ locale: 'he' as AppLocale });
        const result = await LocaleLayout({
            children: <div data-testid="child-component">Child Component</div>,
            params,
        });

        const html = renderToString(result);

        expect(html).toContain('Child Component');
        expect(html).toContain('lang="he"');
        expect(html).toContain('dir="rtl"');
        expect(nextIntlServer.setRequestLocale).toHaveBeenCalledWith('he');
    });

    it('calls notFound() when locale is invalid', async () => {
        const params = Promise.resolve({ locale: 'invalid' as AppLocale });

        await LocaleLayout({
            children: <div>Child Component</div>,
            params,
        });

        expect(nextNavigation.notFound).toHaveBeenCalled();
    });

    it('calls notFound() when locale module cannot be loaded', async () => {
        vi.mock('@/locales/fr.json', () => {
            throw new Error('Module not found');
        });

        const params = Promise.resolve({ locale: 'fr' as AppLocale });

        await LocaleLayout({
            children: <div>Child Component</div>,
            params,
        });

        expect(nextNavigation.notFound).toHaveBeenCalled();
    });

    it('generates static params for all supported locales', () => {
        const params = generateStaticParams();

        expect(params).toEqual([
            { locale: 'en' },
            { locale: 'he' }
        ]);
    });
});