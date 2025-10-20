import { render, screen } from '@/tests/utils/renderWithIntl';
import ForecastList from '@/components/ForecastList/ForecastList';
import { describe, it, expect } from 'vitest';
import type { WeatherForecastItem } from '@/types/weather';

const forecastMock: WeatherForecastItem[] = [
  { date: 1721174400, min: 22, max: 32, icon: '01d', desc: 'Clear sky', codeId: 800 },
  { date: 1721088000, min: 21, max: 30, icon: '03d', desc: 'Cloudy', codeId: 803 },
  { date: 1721001600, min: 20, max: 29, icon: '10d', desc: 'Rainy', codeId: 500 },
];

describe('ForecastList', () => {
  it('renders forecast items with dates and temperatures', () => {
    render(<ForecastList forecast={forecastMock} unit="metric" cityUnit="metric" />);

    const dateEls = screen.getAllByTestId('forecast-date');
    expect(dateEls).toHaveLength(3);

    const minTemps = screen.getAllByTestId('forecast-min');
    const maxTemps = screen.getAllByTestId('forecast-max');
    expect(minTemps.map(el => el.textContent)).toEqual(['22°C', '21°C', '20°C']);
    expect(maxTemps.map(el => el.textContent)).toEqual(['32°C', '30°C', '29°C']);
  });

  it('renders weather condition translations', () => {
    render(<ForecastList forecast={forecastMock} unit="metric" cityUnit="metric" />);
     // Check for alt text in images instead of text content
     expect(screen.getByAltText('Clear sky')).toBeInTheDocument();
     expect(screen.getByAltText('Cloudy')).toBeInTheDocument();
     expect(screen.getByAltText('Rainy')).toBeInTheDocument();
  });

  it('renders translated forecast title', () => {
    render(<ForecastList forecast={forecastMock} unit="metric" cityUnit="metric" />);
    expect(screen.getByRole('heading')).toHaveTextContent(/forecast/i);
  });

  it('handles unit conversion between imperial and metric', () => {
    render(<ForecastList forecast={forecastMock} unit="imperial" cityUnit="metric" />);
    const minTemps = screen.getAllByTestId('forecast-min').map(el => el.textContent);
    const maxTemps = screen.getAllByTestId('forecast-max').map(el => el.textContent);
    expect(minTemps).toEqual(['72°F', '70°F', '68°F']);
    expect(maxTemps).toEqual(['90°F', '86°F', '84°F']);
  });

  it('renders correctly with Hebrew locale', () => {
    render(<ForecastList forecast={forecastMock} unit="metric" cityUnit="metric" />, {
      locale: 'he',
    });
    expect(screen.getByRole('heading')).toBeInTheDocument(); // סתם בדיקה כללית שהתרגום עובד
  });

  it('renders nothing if forecast is empty', () => {
    render(<ForecastList forecast={[]} unit="metric" cityUnit="metric" />);
    expect(screen.queryByTestId('forecast-item')).not.toBeInTheDocument();
  });

  it('passes correct props to WeatherIcon', () => {
    render(<ForecastList forecast={[forecastMock[0]]} unit="metric" cityUnit="metric" />);
    const img = screen.getByRole('img', { name: /clear sky/i });
    expect(img).toHaveAttribute('title', 'Clear sky');
    expect(img).toHaveAttribute('alt', 'Clear sky');
  });
});
