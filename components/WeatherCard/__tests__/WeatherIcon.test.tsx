import { render, screen } from '@/test/utils/renderWithIntl';
import { weatherIconMap } from '@/lib/weatherIconMap';
import { WeatherIcon } from './WeatherIcon';

describe('WeatherIcon', () => {
    it('renders the correct weather icon for a known code', () => {
        render(<WeatherIcon code="01d" alt="clear sky" />);
        const image = screen.getByRole('img', { name: /clear sky/i });
        expect(image).toHaveAttribute('src', expect.stringContaining(weatherIconMap['01d']));
    });

    it('renders the default icon for an unknown code', () => {
        render(<WeatherIcon code="UNKNOWN" alt="unknown icon" />);
        const image = screen.getByRole('img', { name: /unknown icon/i });
        expect(image).toHaveAttribute('src', expect.stringContaining(weatherIconMap.default));
    });

    it('applies correct width and height from size prop', () => {
        const size = 64;
        render(<WeatherIcon code="01d" size={size} />);
        const wrapper = screen.getByRole('img').parentElement;
        expect(wrapper).toHaveStyle({ width: `${size}px`, height: `${size}px` });
    });

    it('sets loading and fetchPriority based on priority=false', () => {
        render(<WeatherIcon code="01d" priority={false} alt="icon" />);
        const image = screen.getByRole('img', { name: /icon/i });
        expect(image).toHaveAttribute('loading', 'lazy');
        expect(image).toHaveAttribute('fetchPriority', 'auto');
    });

    it('sets loading and fetchPriority based on priority=true (default)', () => {
        render(<WeatherIcon code="01d" alt="icon" />);
        const image = screen.getByRole('img', { name: /icon/i });
        expect(image).toHaveAttribute('loading', 'eager');
        expect(image).toHaveAttribute('fetchPriority', 'high');
    });

    it('applies className to the container div', () => {
        render(<WeatherIcon code="01d" className="test-class" />);
        const wrapper = screen.getByRole('img').parentElement;
        expect(wrapper).toHaveClass('test-class');
    });

    it('sets correct title and accessibility attributes', () => {
        render(<WeatherIcon code="01d" alt="Sunny" title="Sunny Icon" />);
        const image = screen.getByRole('img', { name: /sunny/i });
        expect(image).toHaveAttribute('title', 'Sunny Icon');
        expect(image).toHaveAttribute('aria-label', 'Sunny');
        expect(image).toHaveAttribute('aria-hidden', 'false');
    });

    it('hides icon from accessibility tree if alt is empty', () => {
        const { container } = render(<WeatherIcon code="01d" alt="" />);
        const image = container.querySelector('img');
        expect(image).toHaveAttribute('aria-hidden', 'true');
        expect(image).not.toHaveAttribute('aria-label');
    });
});
