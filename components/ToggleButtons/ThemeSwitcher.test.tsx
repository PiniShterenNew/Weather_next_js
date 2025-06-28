import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/utils/renderWithIntl';
import userEvent from '@testing-library/user-event';
import ThemeSwitcher from './ThemeSwitcher';
import type { ThemeMode } from '@/types/ui';
import { act } from 'react';

// Mock Zustand store
const mockSetTheme = vi.fn();
const stateMock = {
    theme: 'light' as ThemeMode,
    setTheme: mockSetTheme,
};

vi.mock('@/stores/useWeatherStore', () => ({
    useWeatherStore: (selector: any) => selector(stateMock),
}));

beforeEach(() => {
    vi.clearAllMocks();
    stateMock.theme = 'light'; // Default
});

describe('ThemeSwitcher', () => {
    it('displays matching icon and name when theme is light', () => {
        stateMock.theme = 'light';
        render(<ThemeSwitcher />);
        expect(screen.getByRole('button', { name: 'Light' })).toBeInTheDocument();
        expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
        expect(screen.getByRole('button').innerHTML).toMatch(/sun/i);
    });

    it('displays matching icon and name when theme is dark', () => {
        stateMock.theme = 'dark';
        render(<ThemeSwitcher />);
        expect(screen.getByRole('button', { name: 'Dark' })).toBeInTheDocument();
        expect(screen.getByRole('button').innerHTML).toMatch(/moon/i);
    });

    it('displays matching icon and name when theme is system', () => {
        stateMock.theme = 'system';
        render(<ThemeSwitcher />);
        expect(screen.getByRole('button', { name: 'System' })).toBeInTheDocument();
        expect(screen.getByRole('button').innerHTML).toMatch(/laptop/i);
    });

    it('changes to dark when clicking the button in light mode', async () => {
        stateMock.theme = 'light';
        render(<ThemeSwitcher />);
        const user = userEvent.setup();
        await user.click(screen.getByRole('button'));
        expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('changes to system when clicking the button in dark mode', async () => {
        stateMock.theme = 'dark';
        render(<ThemeSwitcher />);
        const user = userEvent.setup();
        await user.click(screen.getByRole('button'));
        expect(mockSetTheme).toHaveBeenCalledWith('system');
    });

    it('changes to light when clicking the button in system mode', async () => {
        stateMock.theme = 'system';
        render(<ThemeSwitcher />);
        const user = userEvent.setup();
        await user.click(screen.getByRole('button'));
        expect(mockSetTheme).toHaveBeenCalledWith('light');
    });

    it('tooltip displays the text of the current value', async () => {
        stateMock.theme = 'system';
        render(<ThemeSwitcher />);
        const user = userEvent.setup();
        const btn = screen.getByRole('button', { name: 'System' });
        await user.hover(btn);
        // Make sure there is at least one element with the text
        const tooltips = await screen.findAllByText('System');
        expect(tooltips.length).toBeGreaterThanOrEqual(1);
    });

    it('maintains correct aria-label', () => {
        stateMock.theme = 'dark';
        render(<ThemeSwitcher />);
        expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Dark');
    });
});
