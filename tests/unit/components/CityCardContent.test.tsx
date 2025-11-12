import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/tests/utils/renderWithIntl';
import CityCardContent from '@/features/cities/components/CityCardContent';
import { cityWeather } from '../../fixtures/cityWeather';

describe('CityCardContent', () => {
  const defaultProps = {
    city: cityWeather,
    locale: 'en' as const,
    unit: 'metric' as const,
    isCurrentLocation: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders city name', () => {
    render(<CityCardContent {...defaultProps} />);
    expect(screen.getByText('New York')).toBeInTheDocument();
  });

  it('renders country name', () => {
    render(<CityCardContent {...defaultProps} />);
    expect(screen.getByText('United States')).toBeInTheDocument();
  });

  it('displays temperature with correct unit (metric)', () => {
    render(<CityCardContent {...defaultProps} unit="metric" />);
    const temp = screen.getByText(/19°C/);
    expect(temp).toBeInTheDocument();
  });

  it('displays temperature with correct unit (imperial)', () => {
    render(<CityCardContent {...defaultProps} unit="imperial" />);
    const temp = screen.getByText(/66°F/);
    expect(temp).toBeInTheDocument();
  });

  it('shows current location indicator when isCurrentLocation is true', () => {
    render(<CityCardContent {...defaultProps} isCurrentLocation={true} />);
    const locationIcon = screen.getByLabelText('Current Location');
    expect(locationIcon).toBeInTheDocument();
  });

  it('hides current location indicator when isCurrentLocation is false', () => {
    render(<CityCardContent {...defaultProps} isCurrentLocation={false} />);
    const locationIcon = screen.queryByLabelText('Current Location');
    expect(locationIcon).not.toBeInTheDocument();
  });

  it('applies bold font when isCurrentLocation is true', () => {
    render(<CityCardContent {...defaultProps} isCurrentLocation={true} />);
    const cityName = screen.getByText('New York');
    // Font class is on the h3 parent, not the span
    const h3 = cityName.closest('h3');
    expect(h3).toHaveClass('font-bold');
  });

  it('applies semibold font when isCurrentLocation is false', () => {
    render(<CityCardContent {...defaultProps} isCurrentLocation={false} />);
    const cityName = screen.getByText('New York');
    // Font class is on the h3 parent, not the span
    const h3 = cityName.closest('h3');
    expect(h3).toHaveClass('font-semibold');
  });

  it('displays weather icon', () => {
    render(<CityCardContent {...defaultProps} />);
    // WeatherIcon uses img tag, not SVG
    const weatherIcon = document.querySelector('img[alt="weather icon"]') || 
                       document.querySelector('img[role="img"]');
    expect(weatherIcon).toBeInTheDocument();
  });

  it('uses Hebrew locale when locale is Hebrew', () => {
    const cityWithHebrew = {
      ...cityWeather,
      name: { en: 'New York', he: 'ניו יורק' },
      country: { en: 'United States', he: 'ארצות הברית' },
    };
    render(<CityCardContent {...defaultProps} city={cityWithHebrew} locale="he" />);
    expect(screen.getByText('ניו יורק')).toBeInTheDocument();
    expect(screen.getByText('ארצות הברית')).toBeInTheDocument();
  });

  it('falls back to English when Hebrew translation is missing', () => {
    const cityWithoutHebrew = {
      ...cityWeather,
      name: { en: 'Paris' },
      country: { en: 'France' },
    };
    render(<CityCardContent {...defaultProps} city={cityWithoutHebrew} locale="he" />);
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('France')).toBeInTheDocument();
  });

  it('displays "--°" when temperature is not available', () => {
    const cityWithoutTemp = {
      ...cityWeather,
      current: {
        ...cityWeather.current,
        temp: undefined,
      },
    };
    render(<CityCardContent {...defaultProps} city={cityWithoutTemp} />);
    expect(screen.getByText('--°')).toBeInTheDocument();
  });

  it('rounds temperature to nearest integer', () => {
    const cityWithDecimalTemp = {
      ...cityWeather,
      current: {
        ...cityWeather.current,
        temp: 19.7,
      },
    };
    render(<CityCardContent {...defaultProps} city={cityWithDecimalTemp} unit="metric" />);
    expect(screen.getByText('20°C')).toBeInTheDocument();
  });

  it('handles missing country gracefully', () => {
    const cityWithoutCountry = {
      ...cityWeather,
      country: undefined,
    };
    render(<CityCardContent {...defaultProps} city={cityWithoutCountry} />);
    // Should not crash, country should not be displayed
    expect(screen.getByText('New York')).toBeInTheDocument();
  });
});

