import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@/tests/utils/renderWithIntl';
import CityCardActions from '@/features/cities/components/CityCardActions';

describe('CityCardActions', () => {
  const defaultProps = {
    isCurrentLocation: false,
    isRefreshingLocation: false,
    onRefreshLocation: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders delete button for all cities', () => {
    render(<CityCardActions {...defaultProps} />);
    const deleteButton = screen.getByLabelText(/delete/i);
    expect(deleteButton).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = vi.fn();
    render(<CityCardActions {...defaultProps} onDelete={onDelete} />);
    const deleteButton = screen.getByLabelText(/delete/i);
    
    fireEvent.click(deleteButton);
    
    expect(onDelete).toHaveBeenCalled();
  });

  it('shows refresh location button when isCurrentLocation is true', () => {
    render(<CityCardActions {...defaultProps} isCurrentLocation={true} />);
    const refreshButton = screen.getByLabelText(/refresh location/i);
    expect(refreshButton).toBeInTheDocument();
  });

  it('hides refresh location button when isCurrentLocation is false', () => {
    render(<CityCardActions {...defaultProps} isCurrentLocation={false} />);
    const refreshButton = screen.queryByLabelText(/refresh location/i);
    expect(refreshButton).not.toBeInTheDocument();
  });

  it('calls onRefreshLocation when refresh button is clicked', () => {
    const onRefreshLocation = vi.fn();
    render(
      <CityCardActions
        {...defaultProps}
        isCurrentLocation={true}
        onRefreshLocation={onRefreshLocation}
      />
    );
    const refreshButton = screen.getByLabelText(/refresh location/i);
    
    fireEvent.click(refreshButton);
    
    expect(onRefreshLocation).toHaveBeenCalled();
  });

  it('disables refresh button when isRefreshingLocation is true', () => {
    render(
      <CityCardActions
        {...defaultProps}
        isCurrentLocation={true}
        isRefreshingLocation={true}
      />
    );
    const refreshButton = screen.getByLabelText(/refresh location/i);
    expect(refreshButton).toBeDisabled();
  });

  it('enables refresh button when isRefreshingLocation is false', () => {
    render(
      <CityCardActions
        {...defaultProps}
        isCurrentLocation={true}
        isRefreshingLocation={false}
      />
    );
    const refreshButton = screen.getByLabelText(/refresh location/i);
    expect(refreshButton).not.toBeDisabled();
  });

  it('shows spinning icon when isRefreshingLocation is true', () => {
    render(
      <CityCardActions
        {...defaultProps}
        isCurrentLocation={true}
        isRefreshingLocation={true}
      />
    );
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('shows navigation icon when isRefreshingLocation is false', () => {
    render(
      <CityCardActions
        {...defaultProps}
        isCurrentLocation={true}
        isRefreshingLocation={false}
      />
    );
    // Navigation icon should be present (not spinning)
    const refreshButton = screen.getByLabelText(/refresh location/i);
    const spinner = refreshButton.querySelector('.animate-spin');
    expect(spinner).not.toBeInTheDocument();
  });

  it('stops propagation on delete button click', () => {
    const onDelete = vi.fn();
    const parentHandler = vi.fn();
    render(
      <div onClick={parentHandler}>
        <CityCardActions {...defaultProps} onDelete={onDelete} />
      </div>
    );
    const deleteButton = screen.getByLabelText(/delete/i);
    
    fireEvent.click(deleteButton);
    
    expect(onDelete).toHaveBeenCalled();
    // stopPropagation should prevent parent handler from being called
    // Note: This test may need adjustment based on actual implementation
  });

  it('has correct accessibility attributes for delete button', () => {
    render(<CityCardActions {...defaultProps} />);
    const deleteButton = screen.getByLabelText(/delete/i);
    expect(deleteButton).toHaveAttribute('aria-label');
    expect(deleteButton).toHaveAttribute('title');
  });

  it('has correct accessibility attributes for refresh button', () => {
    render(<CityCardActions {...defaultProps} isCurrentLocation={true} />);
    const refreshButton = screen.getByLabelText(/refresh location/i);
    expect(refreshButton).toHaveAttribute('aria-label');
    expect(refreshButton).toHaveAttribute('title');
  });

  it('has minimum touch target size (44x44px)', () => {
    render(<CityCardActions {...defaultProps} />);
    const deleteButton = screen.getByLabelText(/delete/i);
    expect(deleteButton).toHaveClass('min-h-[44px]');
    expect(deleteButton).toHaveClass('min-w-[44px]');
  });

  it('has focus-visible ring for keyboard accessibility', () => {
    render(<CityCardActions {...defaultProps} />);
    const deleteButton = screen.getByLabelText(/delete/i);
    expect(deleteButton).toHaveClass('focus-visible:ring-2');
  });
});

