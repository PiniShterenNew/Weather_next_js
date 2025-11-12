import React from 'react'
import { render, screen } from '@/tests/utils/renderWithIntl'
import { vi } from 'vitest'

vi.mock('next-intl', async (importOriginal: () => Promise<typeof import('next-intl')>) => {
    const actual = await importOriginal()
    return {
      ...actual,
      useLocale: () => 'en',
      useTranslations: () => (k: string) => k,
    }
  })

const addLocationSpy = vi.fn()
vi.mock('@/features/search/components/quickAdd/AddLocation', () => ({
    __esModule: true,
    default: (p: any) => {
        addLocationSpy(p)
        return (
            <button
                data-testid="add-location"
                data-type={p.type}
                data-size={p.size}
            />
        )
    },
}))

const popularCitiesSpy = vi.fn()
vi.mock('@/features/search/components/quickAdd/PopularCities', () => ({
    __esModule: true,
    default: (p: any) => {
        popularCitiesSpy(p)
        return (
            <div
                data-testid="popular-cities"
                data-direction={p.direction}
                data-color={p.color}
            />
        )
    },
}))

vi.mock('framer-motion', () => ({
    motion: new Proxy({}, { get: () => (props: any) => <div {...props} /> }),
}))

vi.mock('@/lib/intl', () => ({ getDirection: vi.fn(() => 'rtl') }))

import EmptyPage from '@/features/ui/components/EmptyPage'

describe('WeatherEmpty (presentation only)', () => {
    it('renders headline, description and star icon', () => {
        render(<EmptyPage />)
        // The component uses translation keys, so we check for the test-id instead
        expect(screen.getByTestId('weather-empty')).toBeInTheDocument()
        // Check for Star icon (lucide-react component renders as SVG)
        expect(document.querySelector('svg')).toBeInTheDocument()
    })

    it('passes correct props to AddLocation', () => {
        render(<EmptyPage />)
        expect(addLocationSpy).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'default', size: 'lg' })
        )
        const btn = screen.getByTestId('add-location')
        expect(btn).toHaveAttribute('data-type', 'default')
        expect(btn).toHaveAttribute('data-size', 'lg')
    })

    it('passes correct props to PopularCities', () => {
        render(<EmptyPage />)
        expect(popularCitiesSpy).toHaveBeenCalledWith(
            expect.objectContaining({ direction: 'rtl', color: 'primary' })
        )
        const pc = screen.getByTestId('popular-cities')
        expect(pc).toHaveAttribute('data-direction', 'rtl')
        expect(pc).toHaveAttribute('data-color', 'primary')
    })
})
