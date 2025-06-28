import { render, screen } from '@/test/utils/renderWithIntl'
import ForecastList from './ForecastList'
import type { WeatherForecastItem } from '@/types/weather'

const forecast: WeatherForecastItem[] = [
    {
        date: 1719157200, // Tue, 24 Jun 2024 @ 18:00:00 UTC
        min: 21,
        max: 29,
        icon: '01d',
        desc: 'Sunny',
    },
    {
        date: 1719243600, // Wed, 25 Jun 2024 @ 18:00:00 UTC
        min: 22,
        max: 30,
        icon: '02d',
        desc: 'Partly cloudy',
    },
];

describe('ForecastListComponent', () => {
    it('renders the forecast title', () => {
        render(<ForecastList forecast={forecast} unit="metric" />)
        expect(screen.getByRole('heading', { name: '5-Day Forecast' })).toBeInTheDocument()
    })

    it('renders correct number of forecast items', () => {
        render(<ForecastList forecast={forecast} unit="metric" />)
        expect(screen.getAllByTestId('forecast-item')).toHaveLength(forecast.length)
    })

    it('renders each forecast date', () => {
        render(<ForecastList forecast={forecast} unit="metric" />)
        const dates = screen.getAllByTestId('forecast-date')
        expect(dates.map(el => el.textContent)).toEqual(["23 Sun", "24 Mon"])
    })

    it('renders temperature ranges correctly', () => {
        render(<ForecastList forecast={forecast} unit="metric" />)
        expect(screen.getAllByTestId('forecast-max')[0]).toHaveTextContent('29')
        expect(screen.getAllByTestId('forecast-min')[0]).toHaveTextContent('21')
        expect(screen.getAllByTestId('forecast-max')[1]).toHaveTextContent('30')
        expect(screen.getAllByTestId('forecast-min')[1]).toHaveTextContent('22')
    })

    it('renders the weather descriptions as icon alt and title', () => {
        render(<ForecastList forecast={forecast} unit="metric" />)
        expect(screen.getByRole('img', { name: 'Sunny' })).toBeInTheDocument()
        expect(screen.getByRole('img', { name: 'Partly cloudy' })).toBeInTheDocument()
    })
})
