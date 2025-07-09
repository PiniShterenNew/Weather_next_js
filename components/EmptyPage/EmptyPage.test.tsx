import React from 'react'
import { render, screen } from '@/test/utils/renderWithIntl'
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
vi.mock('@/components/QuickAdd/AddLocation.lazy', () => ({
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
vi.mock('@/components/QuickAdd/PopularCities', () => ({
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

import EmptyPage from './EmptyPage'

describe('WeatherEmpty (presentation only)', () => {
    it('renders headline, description and star icon', () => {
        render(<EmptyPage />)
        expect(screen.getByText('empty')).toBeInTheDocument()
        expect(screen.getByText('emptyDescription')).toBeInTheDocument()
        expect(document.querySelector('svg.lucide-star')).toBeInTheDocument()
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
