import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@/tests/utils/renderWithIntl';
import userEvent from '@testing-library/user-event';
import SearchInput from '@/features/search/components/SearchInput';

describe('SearchInput', () => {
  const defaultProps = {
    query: '',
    loading: false,
    locale: 'en' as const,
    direction: 'ltr' as const,
    onQueryChange: vi.fn(),
    onFocus: vi.fn(),
    onBlur: vi.fn(),
    onKeyDown: vi.fn(),
    onClear: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input with placeholder', () => {
    render(<SearchInput {...defaultProps} />);
    const input = screen.getByTestId('city-search-input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('displays query value', () => {
    render(<SearchInput {...defaultProps} query="London" />);
    const input = screen.getByTestId('city-search-input') as HTMLInputElement;
    expect(input.value).toBe('London');
  });

  it('calls onQueryChange when input value changes', async () => {
    const user = userEvent.setup();
    render(<SearchInput {...defaultProps} />);
    const input = screen.getByTestId('city-search-input');
    
    await user.type(input, 'Paris');
    
    expect(defaultProps.onQueryChange).toHaveBeenCalled();
  });

  it('calls onFocus when input is focused', async () => {
    const user = userEvent.setup();
    render(<SearchInput {...defaultProps} />);
    const input = screen.getByTestId('city-search-input');
    
    await user.click(input);
    
    expect(defaultProps.onFocus).toHaveBeenCalled();
  });

  it('calls onBlur when input loses focus', async () => {
    const user = userEvent.setup();
    render(<SearchInput {...defaultProps} />);
    const input = screen.getByTestId('city-search-input');
    
    await user.click(input);
    await user.tab();
    
    expect(defaultProps.onBlur).toHaveBeenCalled();
  });

  it('calls onKeyDown when key is pressed', async () => {
    const user = userEvent.setup();
    render(<SearchInput {...defaultProps} />);
    const input = screen.getByTestId('city-search-input');
    
    await user.type(input, 'L');
    await user.keyboard('{Enter}');
    
    expect(defaultProps.onKeyDown).toHaveBeenCalled();
  });

  it('shows clear button when query has value', () => {
    render(<SearchInput {...defaultProps} query="London" />);
    const clearButton = screen.getByRole('button', { name: /clear/i });
    expect(clearButton).toBeInTheDocument();
  });

  it('hides clear button when query is empty', () => {
    render(<SearchInput {...defaultProps} query="" />);
    const clearButton = screen.queryByRole('button', { name: /clear/i });
    expect(clearButton).not.toBeInTheDocument();
  });

  it('calls onClear when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<SearchInput {...defaultProps} query="London" />);
    const clearButton = screen.getByRole('button', { name: /clear/i });
    
    await user.click(clearButton);
    
    expect(defaultProps.onClear).toHaveBeenCalled();
  });

  it('shows loading spinner when loading is true', () => {
    render(<SearchInput {...defaultProps} loading={true} />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    // Loader2 is an SVG component from lucide-react
    // Check for the presence of an element with animate-spin class
    const animateSpinElement = document.querySelector('.animate-spin');
    expect(animateSpinElement).toBeInTheDocument();
    // Verify it's an SVG (Loader2 renders as SVG)
    expect(animateSpinElement?.tagName.toLowerCase()).toBe('svg');
  });

  it('shows search icon when not loading', () => {
    render(<SearchInput {...defaultProps} loading={false} />);
    // Search icon is an SVG without role="img", just check for its presence
    const searchIcon = document.querySelector('svg.lucide-search');
    expect(searchIcon).toBeInTheDocument();
    expect(searchIcon).not.toHaveClass('animate-spin');
  });

  it('applies RTL direction classes when direction is rtl', () => {
    render(<SearchInput {...defaultProps} direction="rtl" />);
    const input = screen.getByTestId('city-search-input');
    expect(input).toHaveClass('text-right');
    expect(input).toHaveClass('pl-12');
  });

  it('applies LTR direction classes when direction is ltr', () => {
    render(<SearchInput {...defaultProps} direction="ltr" />);
    const input = screen.getByTestId('city-search-input');
    expect(input).toHaveClass('text-left');
    expect(input).toHaveClass('pl-12');
  });

  it('normalizes input to remove direction markers', async () => {
    const user = userEvent.setup();
    const onQueryChange = vi.fn();
    render(<SearchInput {...defaultProps} onQueryChange={onQueryChange} />);
    const input = screen.getByTestId('city-search-input');
    
    // Simulate input with direction markers
    fireEvent.change(input, { target: { value: 'לL oאnבdיoבn' } });
    
    // The normalization should remove direction markers
    expect(onQueryChange).toHaveBeenCalled();
    const normalizedValue = onQueryChange.mock.calls[0][0];
    expect(normalizedValue).not.toMatch(/[\u200e-\u202e]/);
  });

  it('calls onFocus when typing if input is not focused', async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    render(<SearchInput {...defaultProps} onFocus={onFocus} />);
    const input = screen.getByTestId('city-search-input');
    
    // Blur first
    await user.tab();
    
    // Then type (should trigger onFocus)
    fireEvent.change(input, { target: { value: 'L' } });
    
    // Note: This test may need adjustment based on actual behavior
    expect(onFocus).toHaveBeenCalled();
  });
});

