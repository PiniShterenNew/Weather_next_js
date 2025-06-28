import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/utils/renderWithIntl';
import userEvent from '@testing-library/user-event';
import TempUnitToggle from './TempUnitToggle';
import type { TemporaryUnit } from '@/types/ui';

const mockSetUnit = vi.fn();
const stateMock = {
    unit: 'metric' as TemporaryUnit,
    setUnit: mockSetUnit,
};

vi.mock('@/stores/useWeatherStore', () => ({
    useWeatherStore: (selector: any) => selector(stateMock),
}));

beforeEach(() => {
    vi.clearAllMocks();
    // Ensure default state
    stateMock.unit = 'metric';
});

describe('TempUnitToggle', () => {
    it('displays the correct unit (°C) when unit is metric', () => {
        stateMock.unit = 'metric';
        render(<TempUnitToggle />);
        expect(screen.getByRole('button', { name: /Toggle Unit °C/ })).toBeInTheDocument();
        expect(screen.getByText('°C')).toBeInTheDocument();
    });

    it('displays the correct unit (°F) when unit is imperial', () => {
        stateMock.unit = 'imperial';
        render(<TempUnitToggle />);
        expect(screen.getByRole('button', { name: /Toggle Unit °F/ })).toBeInTheDocument();
        expect(screen.getByText('°F')).toBeInTheDocument();
    });

    it('changes the unit to imperial when clicking the button if it was metric', async () => {
        stateMock.unit = 'metric';
        render(<TempUnitToggle />);
        const user = userEvent.setup();
        await user.click(screen.getByRole('button', { name: /Toggle Unit °C/ }));
        expect(mockSetUnit).toHaveBeenCalledWith('imperial');
    });

    it('changes the unit to metric when clicking the button if it was imperial', async () => {
        stateMock.unit = 'imperial';
        render(<TempUnitToggle />);
        const user = userEvent.setup();
        await user.click(screen.getByRole('button', { name: /Toggle Unit °F/ }));
        expect(mockSetUnit).toHaveBeenCalledWith('metric');
    });

    it('maintains dir="ltr" and variant="outline"', () => {
        stateMock.unit = 'metric';
        render(<TempUnitToggle />);
        const btn = screen.getByRole('button');
        expect(btn).toHaveAttribute('dir', 'ltr');
        // Check class for extra precision:
        expect(btn.className).toMatch(/outline/);
    });
});