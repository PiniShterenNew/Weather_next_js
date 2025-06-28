import { render } from '@testing-library/react';
import { ThemeAndDirectionProvider } from '@/providers/ThemeAndDirectionProvider';
import { useWeatherStore } from '@/stores/useWeatherStore';
import { vi } from 'vitest';

vi.mock('@/stores/useWeatherStore', () => ({
  useWeatherStore: vi.fn(),
}));

describe('ThemeAndDirectionProvider', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeAll(() => {
    originalMatchMedia = window.matchMedia;
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query.includes('dark'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterAll(() => {
    window.matchMedia = originalMatchMedia;
  });

  afterEach(() => {
    document.documentElement.className = ''; // reset classList
  });

  it('adds "dark" class when theme is "dark"', () => {
    (useWeatherStore as any).mockReturnValue('dark');
    render(<ThemeAndDirectionProvider />);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('adds "light" class when theme is "light"', () => {
    (useWeatherStore as any).mockReturnValue('light');
    render(<ThemeAndDirectionProvider />);
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  it('uses system preference when theme is "system"', () => {
    (useWeatherStore as any).mockReturnValue('system');
    render(<ThemeAndDirectionProvider />);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
