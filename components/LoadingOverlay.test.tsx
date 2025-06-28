import { vi } from 'vitest';
import { render, screen } from '@/test/utils/renderWithIntl';
import LoadingOverlay from './LoadingOverlay';

const mockUseWeatherStore = vi.fn();

vi.mock('@/stores/useWeatherStore', () => ({
  useWeatherStore: (selector: any) => mockUseWeatherStore(selector),
}));

describe('LoadingOverlay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render anything if isLoading is false', () => {
    mockUseWeatherStore.mockImplementation((selector) => selector({ isLoading: false }));
    const { container } = render(<LoadingOverlay />);
    expect(container.innerHTML).toBe('');
  });

  it('renders overlay and translated text when isLoading is true', () => {
    mockUseWeatherStore.mockImplementation((selector) => selector({ isLoading: true }));
    render(<LoadingOverlay />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByText('Loading...').closest('.bg-white')).toBeInTheDocument();
    expect(document.querySelector('.fixed.inset-0.z-50')).toBeInTheDocument();
  });
});
