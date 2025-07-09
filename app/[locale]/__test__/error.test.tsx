import { render, screen, fireEvent } from '@/test/utils/renderWithIntl';
import LocaleError from '../error';
import { vi } from 'vitest';

describe('LocaleError Component', () => {
  const mockError = new Error('Test error message');
  mockError.stack = 'Test error stack';
  const mockReset = vi.fn();
  
  // Store original window.location
  const originalHref = window.location.href;
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location.href
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' }
    });
  });
  
  afterEach(() => {
    // Restore window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: originalHref }
    });
  });

  it('renders error component with correct translations', () => {
    render(<LocaleError error={mockError} reset={mockReset} />);

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('An error occurred')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Go Home')).toBeInTheDocument();
  });

  it('calls reset function when Try Again button is clicked', () => {
    render(<LocaleError error={mockError} reset={mockReset} />);

    const tryAgainButton = screen.getByText('Try Again');
    fireEvent.click(tryAgainButton);
    
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('redirects to home page when Go Home button is clicked', () => {
    render(<LocaleError error={mockError} reset={mockReset} />);

    const goHomeButton = screen.getByText('Go Home');
    fireEvent.click(goHomeButton);
    
    expect(window.location.href).toBe('/');
  });

  describe('Error details display', () => {
    // Store original NODE_ENV
    const originalNodeEnv = process.env.NODE_ENV;
    
    beforeEach(() => {
      // Mock process.env
      vi.stubEnv('NODE_ENV', originalNodeEnv || 'test');
    });
    
    afterAll(() => {
      // Restore original NODE_ENV
      vi.stubEnv('NODE_ENV', originalNodeEnv);
    });

    it('shows error details in development mode', () => {
      // Set NODE_ENV to development
      vi.stubEnv('NODE_ENV', 'development');
      
      render(<LocaleError error={mockError} reset={mockReset} />);

      expect(screen.getByText('Test error message')).toBeInTheDocument();
      expect(screen.getByText('Test error stack')).toBeInTheDocument();
    });

    it('does not show error details in production mode', () => {
      // Set NODE_ENV to production
      vi.stubEnv('NODE_ENV', 'production');
      
      render(<LocaleError error={mockError} reset={mockReset} />);

      expect(screen.queryByText('Test error message')).not.toBeInTheDocument();
      expect(screen.queryByText('Test error stack')).not.toBeInTheDocument();
    });
  });
});