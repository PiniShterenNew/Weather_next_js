import { render } from '@testing-library/react';
import { ThemeAndDirectionProvider } from '@/providers/ThemeAndDirectionProvider';
import { useWeatherStore } from '@/stores/useWeatherStore';

vi.mock('@/stores/useWeatherStore', () => ({
  useWeatherStore: vi.fn(),
}));

describe('ThemeAndDirectionProvider', () => {
  let originalMatchMedia: typeof window.matchMedia;
  const mockUseWeatherStore = useWeatherStore as any;

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

  beforeEach(() => {
    // Reset document state before each test
    document.documentElement.className = '';
    document.documentElement.dir = '';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Theme functionality', () => {
    it('adds "dark" class when theme is "dark"', () => {
      mockUseWeatherStore.mockReturnValue('dark');
      render(<ThemeAndDirectionProvider locale="en" />);
      
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
    });

    it('adds "light" class when theme is "light"', () => {
      mockUseWeatherStore.mockReturnValue('light');
      render(<ThemeAndDirectionProvider locale="en" />);
      
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('uses system preference when theme is "system" and system prefers dark', () => {
      mockUseWeatherStore.mockReturnValue('system');
      
      // Mock system preference for dark mode
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query.includes('prefers-color-scheme: dark'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(<ThemeAndDirectionProvider locale="en" />);
      
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
    });

    it('uses system preference when theme is "system" and system prefers light', () => {
      mockUseWeatherStore.mockReturnValue('system');
      
      // Mock system preference for light mode
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: false, // System doesn't prefer dark
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(<ThemeAndDirectionProvider locale="en" />);
      
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('removes previous theme classes when theme changes', () => {
      // First render with dark theme
      mockUseWeatherStore.mockReturnValue('dark');
      const { rerender } = render(<ThemeAndDirectionProvider locale="en" />);
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      // Change to light theme
      mockUseWeatherStore.mockReturnValue('light');
      rerender(<ThemeAndDirectionProvider locale="en" />);
      
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('removes existing theme classes before applying new ones', () => {
      // Manually add both classes to test removal
      document.documentElement.classList.add('light', 'dark');
      
      mockUseWeatherStore.mockReturnValue('dark');
      render(<ThemeAndDirectionProvider locale="en" />);
      
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
    });
  });

  describe('Direction functionality', () => {
    it('sets direction to "rtl" for Hebrew locale', () => {
      mockUseWeatherStore.mockReturnValue('light');
      render(<ThemeAndDirectionProvider locale="he" />);
      
      expect(document.documentElement.dir).toBe('rtl');
    });

    it('sets direction to "ltr" for English locale', () => {
      mockUseWeatherStore.mockReturnValue('light');
      render(<ThemeAndDirectionProvider locale="en" />);
      
      expect(document.documentElement.dir).toBe('ltr');
    });

    it('sets direction to "ltr" for unknown locale', () => {
      mockUseWeatherStore.mockReturnValue('light');
      render(<ThemeAndDirectionProvider locale="fr" />);
      
      expect(document.documentElement.dir).toBe('ltr');
    });

    it('updates direction when locale changes', () => {
      mockUseWeatherStore.mockReturnValue('light');
      const { rerender } = render(<ThemeAndDirectionProvider locale="en" />);
      expect(document.documentElement.dir).toBe('ltr');

      rerender(<ThemeAndDirectionProvider locale="he" />);
      expect(document.documentElement.dir).toBe('rtl');

      rerender(<ThemeAndDirectionProvider locale="en" />);
      expect(document.documentElement.dir).toBe('ltr');
    });
  });

  describe('Children rendering', () => {
    it('renders children when provided', () => {
      mockUseWeatherStore.mockReturnValue('light');
      const { getByTestId } = render(
        <ThemeAndDirectionProvider locale="en">
          <div data-testid="child">Test Child</div>
        </ThemeAndDirectionProvider>
      );
      
      expect(getByTestId('child')).toBeInTheDocument();
      expect(getByTestId('child')).toHaveTextContent('Test Child');
    });

    it('renders without children', () => {
      mockUseWeatherStore.mockReturnValue('light');
      const { container } = render(<ThemeAndDirectionProvider locale="en" />);
      
      // Should render an empty fragment
      expect(container.firstChild).toBeNull();
    });

    it('renders multiple children', () => {
      mockUseWeatherStore.mockReturnValue('light');
      const { getByTestId } = render(
        <ThemeAndDirectionProvider locale="en">
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
        </ThemeAndDirectionProvider>
      );
      
      expect(getByTestId('child1')).toBeInTheDocument();
      expect(getByTestId('child2')).toBeInTheDocument();
    });
  });

  describe('Combined functionality', () => {
    it('handles both theme and direction changes simultaneously', () => {
      mockUseWeatherStore.mockReturnValue('dark');
      const { rerender } = render(<ThemeAndDirectionProvider locale="en" />);
      
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.dir).toBe('ltr');

      mockUseWeatherStore.mockReturnValue('light');
      rerender(<ThemeAndDirectionProvider locale="he" />);
      
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(document.documentElement.dir).toBe('rtl');
    });
  });

  describe('Edge cases', () => {
    it('handles undefined theme gracefully', () => {
      mockUseWeatherStore.mockReturnValue(undefined);
      
      expect(() => {
        render(<ThemeAndDirectionProvider locale="en" />);
      }).not.toThrow();
    });

    it('handles empty locale string', () => {
      mockUseWeatherStore.mockReturnValue('light');
      render(<ThemeAndDirectionProvider locale="" />);
      
      expect(document.documentElement.dir).toBe('ltr');
    });

    it('handles null children', () => {
      mockUseWeatherStore.mockReturnValue('light');
      
      expect(() => {
        render(
          <ThemeAndDirectionProvider locale="en">
            {null}
          </ThemeAndDirectionProvider>
        );
      }).not.toThrow();
    });
  });
});