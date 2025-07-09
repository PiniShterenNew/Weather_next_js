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

vi.mock('next-intl', async importOriginal => {
  const actual = await importOriginal<typeof import('next-intl')>();
  return {
    ...actual,
    useLocale: () => 'en',
    useTranslations: () => (k: string) => {
      if (k === 'toggle') return 'Toggle Unit';
      if (k === 'celsius') return '°C';
      if (k === 'fahrenheit') return '°F';
      return k;
    },
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  stateMock.unit = 'metric';
});

describe('TempUnitToggle', () => {
  it('renders °C when unit is metric', () => {
    stateMock.unit = 'metric';
    render(<TempUnitToggle />);
    const btn = screen.getByRole('button', { name: 'Toggle Unit °C' });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('°C');
  });

  it('renders °F when unit is imperial', () => {
    stateMock.unit = 'imperial';
    render(<TempUnitToggle />);
    const btn = screen.getByRole('button', { name: 'Toggle Unit °F' });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('°F');
  });

  it('switches from metric to imperial on click', async () => {
    stateMock.unit = 'metric';
    render(<TempUnitToggle />);
    await userEvent.click(screen.getByRole('button', { name: 'Toggle Unit °C' }));
    expect(mockSetUnit).toHaveBeenCalledWith('imperial');
  });

  it('switches from imperial to metric on click', async () => {
    stateMock.unit = 'imperial';
    render(<TempUnitToggle />);
    await userEvent.click(screen.getByRole('button', { name: 'Toggle Unit °F' }));
    expect(mockSetUnit).toHaveBeenCalledWith('metric');
  });

  it('button has dir="ltr" and outline classes', () => {
    render(<TempUnitToggle />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('dir', 'ltr');
    expect(btn.className).toMatch(/border/);
  });
});
