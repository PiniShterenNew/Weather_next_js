import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils/renderWithIntl';
import Page, { metadata } from '../page';

// Mock HomePage to isolate the test
vi.mock('@/components/HomePage/HomePage', () => ({
  __esModule: true,
  default: () => <div data-testid="home-page">Mocked HomePage</div>,
}));

describe('Home Page (app/[locale]/page.tsx)', () => {
  it('renders the HomePage component', () => {
    render(<Page />);
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('exports the correct metadata', () => {
    expect(metadata).toEqual({
      title: 'Weather App - Home',
      description: 'Check current weather and forecasts for cities around the world',
    });
  });
});
