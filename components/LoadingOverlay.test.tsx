import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { render, screen } from '@/test/utils/renderWithIntl';
import LoadingOverlay from './LoadingOverlay';
import { useWeatherStore } from '@/stores/useWeatherStore';

vi.mock('@/stores/useWeatherStore', async () => {
  const actual = await vi.importActual<typeof import('@/stores/useWeatherStore')>('@/stores/useWeatherStore');
  return {
    ...actual,
    useWeatherStore: vi.fn(),
  };
});

const mockStore = {
  isLoading: false,
};

describe('LoadingOverlay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useWeatherStore as unknown as Mock).mockImplementation((selector: (s: any) => any) =>
      selector(mockStore)
    );
  });

  it('does not render when both store and prop are false', () => {
    render(<LoadingOverlay />);
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  it('renders when store isLoading is true', () => {
    (useWeatherStore as unknown as Mock).mockImplementation((selector: (s: any) => any) =>
      selector({ isLoading: true })
    );
    render(<LoadingOverlay />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders when prop isLoading is true (even if store is false)', () => {
    render(<LoadingOverlay isLoading />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<LoadingOverlay isLoading />);
    const overlay = screen.getByRole('dialog');
    expect(overlay).toHaveAttribute('aria-modal', 'true');
    expect(overlay).toHaveAttribute('aria-labelledby', 'loading-text');

    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveAttribute('role', 'img');
    expect(spinner).toHaveAttribute('aria-label', 'Loading...');
  });
});
