import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/utils/renderWithIntl';
import userEvent from '@testing-library/user-event';
import ThemeSwitcher from './ThemeSwitcher';
import type { ThemeMode } from '@/types/ui';

const mockSetTheme = vi.fn();
const stateMock = {
  theme: 'light' as ThemeMode,
  setTheme: mockSetTheme,
};

vi.mock('@/stores/useWeatherStore', () => ({
  useWeatherStore: (sel: any) => sel(stateMock),
}));

vi.mock('next-intl', async importOriginal => {
  const actual = await importOriginal<typeof import('next-intl')>();
  return {
    ...actual,
    useLocale: () => 'en',
    useTranslations: () => (k: string) => {
      if (k === 'light') return 'Light';
      if (k === 'dark') return 'Dark';
      if (k === 'system') return 'System';
      if (k === 'toggle') return 'Toggle';
      return k;
    },
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  stateMock.theme = 'light';
});

describe('ThemeSwitcher', () => {
  it('renders Light icon and label', () => {
    stateMock.theme = 'light';
    render(<ThemeSwitcher />);
    expect(screen.getByRole('button', { name: 'Light' })).toBeInTheDocument();
    expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
  });

  it('renders Dark icon and label', () => {
    stateMock.theme = 'dark';
    render(<ThemeSwitcher />);
    expect(screen.getByRole('button', { name: 'Dark' })).toBeInTheDocument();
    expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
  });

  it('renders System icon and label', () => {
    stateMock.theme = 'system';
    render(<ThemeSwitcher />);
    expect(screen.getByRole('button', { name: 'System' })).toBeInTheDocument();
    expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
  });

  it('cycles from light to dark', async () => {
    stateMock.theme = 'light';
    render(<ThemeSwitcher />);
    await userEvent.click(screen.getByRole('button'));
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('cycles from dark to system', async () => {
    stateMock.theme = 'dark';
    render(<ThemeSwitcher />);
    await userEvent.click(screen.getByRole('button'));
    expect(mockSetTheme).toHaveBeenCalledWith('system');
  });

  it('cycles from system to light', async () => {
    stateMock.theme = 'system';
    render(<ThemeSwitcher />);
    await userEvent.click(screen.getByRole('button'));
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('shows tooltip with current label', async () => {
    stateMock.theme = 'system';
    render(<ThemeSwitcher />);
    await userEvent.hover(screen.getByRole('button', { name: 'System' }));
    expect(await screen.findAllByText('System')).not.toHaveLength(0);
  });

  it('aria-label matches current label', () => {
    stateMock.theme = 'dark';
    render(<ThemeSwitcher />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Dark');
  });
});
