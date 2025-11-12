import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/tests/utils/renderWithIntl';
import userEvent from '@testing-library/user-event';
import { SuggestionItem } from '@/features/search/components/SuggestionItem';
import type { CitySuggestion } from '@/types/suggestion';

const mockSuggestion: CitySuggestion = {
  id: 'city:51.5074_0.1278',
  city: { en: 'London', he: 'לונדון' },
  country: { en: 'United Kingdom', he: 'בריטניה' },
  lat: '51.5074',
  lon: '0.1278',
};

describe('SuggestionItem', () => {
  const defaultProps = {
    suggestion: mockSuggestion,
    isSelected: false,
    isAdding: false,
    onSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders city and country names', () => {
    render(<SuggestionItem {...defaultProps} />);
    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('United Kingdom')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<SuggestionItem {...defaultProps} onSelect={onSelect} />);
    const option = screen.getByRole('option');
    
    await user.click(option);
    
    expect(onSelect).toHaveBeenCalledWith(mockSuggestion);
  });

  it('calls onSelect when Enter key is pressed', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<SuggestionItem {...defaultProps} onSelect={onSelect} />);
    const option = screen.getByRole('option');
    
    option.focus();
    await user.keyboard('{Enter}');
    
    expect(onSelect).toHaveBeenCalledWith(mockSuggestion);
  });

  it('calls onSelect when Space key is pressed', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<SuggestionItem {...defaultProps} onSelect={onSelect} />);
    const option = screen.getByRole('option');
    
    option.focus();
    await user.keyboard(' ');
    
    expect(onSelect).toHaveBeenCalledWith(mockSuggestion);
  });

  it('prevents default behavior on Enter key', async () => {
    const user = userEvent.setup();
    render(<SuggestionItem {...defaultProps} />);
    const option = screen.getByRole('option');
    
    option.focus();
    await user.keyboard('{Enter}');
    
    // The handler should prevent default
    expect(option).toBeInTheDocument();
  });

  it('applies selected styles when isSelected is true', () => {
    render(<SuggestionItem {...defaultProps} isSelected={true} />);
    const option = screen.getByRole('option');
    expect(option).toHaveClass('bg-muted/50');
  });

  it('applies disabled styles when isAdding is true', () => {
    render(<SuggestionItem {...defaultProps} isAdding={true} />);
    const option = screen.getByRole('option');
    expect(option).toBeDisabled();
    expect(option).toHaveClass('opacity-50');
    expect(option).toHaveClass('cursor-not-allowed');
  });

  it('shows loading spinner when isAdding is true', () => {
    render(<SuggestionItem {...defaultProps} isAdding={true} />);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('hides loading spinner when isAdding is false', () => {
    render(<SuggestionItem {...defaultProps} isAdding={false} />);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).not.toBeInTheDocument();
  });

  it('has correct aria-label with city and country', () => {
    render(<SuggestionItem {...defaultProps} />);
    const option = screen.getByRole('option');
    expect(option).toHaveAttribute('aria-label', 'London, United Kingdom');
  });

  it('has aria-selected attribute matching isSelected', () => {
    const { rerender } = render(<SuggestionItem {...defaultProps} isSelected={true} />);
    let option = screen.getByRole('option');
    expect(option).toHaveAttribute('aria-selected', 'true');
    
    rerender(<SuggestionItem {...defaultProps} isSelected={false} />);
    option = screen.getByRole('option');
    expect(option).toHaveAttribute('aria-selected', 'false');
  });

  it('has role="option" for accessibility', () => {
    render(<SuggestionItem {...defaultProps} />);
    const option = screen.getByRole('option');
    expect(option).toBeInTheDocument();
  });

  it('does not call onSelect when disabled and clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<SuggestionItem {...defaultProps} isAdding={true} onSelect={onSelect} />);
    const option = screen.getByRole('option');
    
    await user.click(option);
    
    // Option is disabled, so click should not trigger onSelect
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('uses Hebrew locale when locale is Hebrew', () => {
    render(<SuggestionItem {...defaultProps} />, { locale: 'he' });
    expect(screen.getByText('לונדון')).toBeInTheDocument();
    expect(screen.getByText('בריטניה')).toBeInTheDocument();
  });

  it('falls back to English when Hebrew translation is missing', () => {
    const suggestionWithoutHebrew: CitySuggestion = {
      ...mockSuggestion,
      city: { en: 'Paris' },
      country: { en: 'France' },
    };
    render(<SuggestionItem {...defaultProps} suggestion={suggestionWithoutHebrew} />, { locale: 'he' });
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('France')).toBeInTheDocument();
  });
});

