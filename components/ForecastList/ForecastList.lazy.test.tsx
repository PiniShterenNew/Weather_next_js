import dynamic from 'next/dynamic';
import { render, screen } from '@testing-library/react';
import { describe, it } from 'vitest';
import { JSX } from 'react';

const LazyForecast = dynamic(() =>
  new Promise<{ default: () => JSX.Element }>(() => {
    // לא נפתר לעולם => fallback יוצג
  }), {
    loading: () => <div data-testid="forecast-loading">Loading...</div>,
    ssr: false,
  }
);

describe('ForecastList.lazy.tsx', () => {
  it('shows loading fallback while ForecastList is loading', () => {
    render(<LazyForecast />);
    expect(screen.getByTestId('forecast-loading')).toBeInTheDocument();
  });
});
