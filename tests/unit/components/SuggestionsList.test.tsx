import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@/tests/utils/renderWithIntl';
import { SuggestionsList } from '@/features/search/components/SuggestionsList';
import type { CitySuggestion } from '@/types/suggestion';

const mockSuggestions: CitySuggestion[] = [
  {
    id: 'city:51.5074_0.1278',
    city: { en: 'London', he: 'לונדון' },
    country: { en: 'United Kingdom', he: 'בריטניה' },
    lat: '51.5074',
    lon: '0.1278',
  },
  {
    id: 'city:48.8566_2.3522',
    city: { en: 'Paris', he: 'פריז' },
    country: { en: 'France', he: 'צרפת' },
    lat: '48.8566',
    lon: '2.3522',
  },
];

describe('SuggestionsList', () => {
  const defaultProps = {
    suggestions: [],
    loading: false,
    hasSearched: false,
    selectedIndex: -1,
    isAdding: null as string | null,
    handleSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when hasSearched is false', () => {
    const { container } = render(<SuggestionsList {...defaultProps} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows loading state when loading is true', () => {
    render(<SuggestionsList {...defaultProps} loading={true} hasSearched={true} />);
    expect(screen.getByText(/searching/i)).toBeInTheDocument();
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('shows no results message when suggestions array is empty and hasSearched is true', () => {
    render(<SuggestionsList {...defaultProps} hasSearched={true} suggestions={[]} />);
    expect(screen.getByText(/no cities found/i)).toBeInTheDocument();
    expect(screen.getByText(/try searching/i)).toBeInTheDocument();
  });

  it('renders all suggestions when provided', () => {
    render(<SuggestionsList {...defaultProps} suggestions={mockSuggestions} hasSearched={true} />);
    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('United Kingdom')).toBeInTheDocument();
    expect(screen.getByText('France')).toBeInTheDocument();
  });

  it('passes isSelected prop to SuggestionItem based on selectedIndex', () => {
    render(
      <SuggestionsList
        {...defaultProps}
        suggestions={mockSuggestions}
        hasSearched={true}
        selectedIndex={0}
      />
    );
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    expect(options[1]).toHaveAttribute('aria-selected', 'false');
  });

  it('passes isAdding prop to SuggestionItem based on suggestion id', () => {
    render(
      <SuggestionsList
        {...defaultProps}
        suggestions={mockSuggestions}
        hasSearched={true}
        isAdding="city:51.5074_0.1278"
      />
    );
    const options = screen.getAllByRole('option');
    expect(options[0]).toBeDisabled();
    expect(options[1]).not.toBeDisabled();
  });

  it('calls handleSelect when a suggestion is clicked', async () => {
    const handleSelect = vi.fn();
    render(
      <SuggestionsList
        {...defaultProps}
        suggestions={mockSuggestions}
        hasSearched={true}
        handleSelect={handleSelect}
      />
    );
    const londonButton = screen.getByText('London').closest('button');
    if (londonButton) {
      fireEvent.click(londonButton);
      expect(handleSelect).toHaveBeenCalledWith(mockSuggestions[0]);
    }
  });

  it('renders suggestions in correct order', () => {
    render(<SuggestionsList {...defaultProps} suggestions={mockSuggestions} hasSearched={true} />);
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveTextContent('London');
    expect(options[1]).toHaveTextContent('Paris');
  });

  it('has scrollable container when suggestions are present', () => {
    const { container } = render(
      <SuggestionsList {...defaultProps} suggestions={mockSuggestions} hasSearched={true} />
    );
    const scrollableDiv = container.querySelector('.overflow-y-auto');
    expect(scrollableDiv).toBeInTheDocument();
  });

  it('does not show loading or no results when suggestions are present', () => {
    render(<SuggestionsList {...defaultProps} suggestions={mockSuggestions} hasSearched={true} />);
    expect(screen.queryByText(/searching/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/no results/i)).not.toBeInTheDocument();
  });
});

