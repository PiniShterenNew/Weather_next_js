// components/WeatherIcon/WeatherIcon.test.tsx
import { render, screen } from '@/tests/utils/renderWithIntl'
import { vi } from 'vitest'
import { weatherIconMapLight } from '@/lib/weatherIconMap'
import { WeatherIcon } from '@/components/WeatherIcon/WeatherIcon'

// mock the theme as "light" so the component always picks weatherIconMapLight
vi.mock('@/store/useWeatherStore', () => ({
  useWeatherStore: (sel: any) => sel({ theme: 'light' }),
}))

describe('WeatherIcon', () => {
  it('renders the correct weather icon for a known code', () => {
    render(<WeatherIcon code="01d" alt="clear sky" />)
    const img = screen.getByRole('img', { name: /clear sky/i })
    expect(img).toHaveAttribute('src', expect.stringContaining(weatherIconMapLight['01d']))
  })

  it('renders the default icon for an unknown code', () => {
    render(<WeatherIcon code="UNKNOWN" alt="unknown icon" />)
    const img = screen.getByRole('img', { name: /unknown icon/i })
    expect(img).toHaveAttribute('src', expect.stringContaining(weatherIconMapLight.default))
  })

  it('applies correct width and height from size prop', () => {
    render(<WeatherIcon code="01d" size={64} alt="icon" />)
    const wrapper = screen.getByRole('img', { name: /icon/i }).parentElement!
    expect(wrapper).toHaveStyle({ width: '64px', height: '64px' })
  })

  it('sets loading & fetchPriority when priority = false', () => {
    render(<WeatherIcon code="01d" priority={false} alt="icon" />)
    const img = screen.getByRole('img', { name: /icon/i })
    expect(img).toHaveAttribute('loading', 'lazy')
    expect(img).toHaveAttribute('fetchpriority', 'auto') // attribute names are lowercase in the DOM
  })

  it('defaults to eager loading & high fetchPriority', () => {
    render(<WeatherIcon code="01d" alt="icon" />)
    const img = screen.getByRole('img', { name: /icon/i })
    expect(img).toHaveAttribute('loading', 'eager')
    expect(img).toHaveAttribute('fetchpriority', 'high')
  })

  it('applies custom className to container', () => {
    render(<WeatherIcon code="01d" className="test-class" alt="icon" />)
    const wrapper = screen.getByRole('img', { name: /icon/i }).parentElement!
    expect(wrapper).toHaveClass('test-class')
  })

  it('sets title & aria attributes when alt provided', () => {
    render(<WeatherIcon code="01d" alt="Sunny" title="Sunny Icon" />)
    const img = screen.getByRole('img', { name: /sunny/i })
    expect(img).toHaveAttribute('title', 'Sunny Icon')
    expect(img).toHaveAttribute('aria-label', 'Sunny')
    expect(img).toHaveAttribute('aria-hidden', 'false')
  })

  it('hides icon from accessibility tree when alt is empty', () => {
    const { container } = render(<WeatherIcon code="01d" alt="" />)
    const img = container.querySelector('img')!
    expect(img).toHaveAttribute('aria-hidden', 'true')
    expect(img).not.toHaveAttribute('aria-label')
  })
})
