import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils/renderWithIntl';
import { SuggestionItem } from './SuggestionItem';
import type { CitySuggestion } from '@/types/suggestion';

const londonSuggestion: CitySuggestion = {
  id: '1',
  city: { en: 'London', he: 'לונדון' },
  country: { en: 'GB', he: 'בריטניה' },
  lat: 51.5,
  lon: -0.12,
};

const handleSelect = vi.fn();

const stateMock = {
  cities: [] as { id: string }[],
};

vi.mock('@/stores/useWeatherStore', () => ({
  useWeatherStore: (sel: any) => sel(stateMock),
}));

const baseProps = {
  city: londonSuggestion,
  index: 0,
  selectedIndex: -1,
  isAdding: null as string | null,
  handleSelect,
};

const renderItem = (extra = {}) =>
  render(<SuggestionItem {...baseProps} {...extra} />);

beforeEach(() => {
  handleSelect.mockClear();
  stateMock.cities = [];
});

describe('SuggestionItem', () => {
  it('renders city and country in English by default', () => {
    renderItem();
    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('GB')).toBeInTheDocument();
  });

  it('renders city and country in Hebrew when locale is he', () => {
    render(<SuggestionItem {...baseProps} />, { locale: 'he' });
    expect(screen.getByText('לונדון')).toBeInTheDocument();
    expect(screen.getByText('בריטניה')).toBeInTheDocument();
  });

  it('calls handleSelect when clicked and city is not added', () => {
    renderItem();
    fireEvent.click(screen.getByText('London'));
    expect(handleSelect).toHaveBeenCalledWith(londonSuggestion);
  });

  it('does not call handleSelect if city already exists', () => {
    stateMock.cities = [{ id: '1' }];
    renderItem();
    fireEvent.click(screen.getByText('London'));
    expect(handleSelect).not.toHaveBeenCalled();
  });

  it('shows loader and check icons when isAdding matches', () => {
    renderItem({ isAdding: '1' });
    expect(screen.getByTestId('suggestion-loader')).toBeInTheDocument();
    expect(screen.getByTestId('suggestion-check')).toBeInTheDocument();
  });

  it('is marked as selected when index equals selectedIndex', () => {
    const { container } = renderItem({ selectedIndex: 0 });
    expect(container.firstChild).toHaveClass('bg-muted');
  });
});
