import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/utils/renderWithIntl';
import LanguageSwitcher from './LanguageSwitcher';
import userEvent from '@testing-library/user-event';

const mockSetLocale = vi.fn();
const mockReplace = vi.fn();
const mockStartTransition = vi.fn((cb) => cb());
const pathname = '/he/weather';

vi.mock('next/navigation', () => ({
    useRouter: () => ({ replace: mockReplace }),
    usePathname: () => pathname,
}));

vi.mock('react', async (original) => {
    const actual = await vi.importActual<typeof import('react')>('react');
    return {
        ...actual,
        useTransition: () => [false, mockStartTransition],
    };
});

vi.mock('@/stores/useWeatherStore', () => ({
    useWeatherStore: (selector: any) =>
        selector({ locale: 'en', setLocale: mockSetLocale }),
}));

beforeEach(() => {
    vi.clearAllMocks();
});

describe('LanguageSwitcher', () => {
    it('renders the current language from the store', () => {
        render(<LanguageSwitcher />);
        expect(screen.getByText('English')).toBeInTheDocument();
    });

    it('calls setLocale with "he" when clicking on "Hebrew"', async () => {
        render(<LanguageSwitcher />);
        const user = userEvent.setup();

        // Opens the menu (Radix doesn't expose options without real interaction)
        const combobox = screen.getByRole('combobox');
        await user.click(combobox);
        await user.keyboard('[ArrowDown]');

        // Selects the option with text containing "Hebrew"
        const option = await screen.findByText('Hebrew');

        await user.click(option);
        expect(mockSetLocale).toHaveBeenCalledWith('he');
    });

    it('calls router.replace with the new path', async () => {
        render(<LanguageSwitcher />);
        const user = userEvent.setup();
        const combobox = screen.getByRole('combobox');

        await user.click(combobox);
        const option = await screen.findByText('Hebrew');
        await user.click(option);

        expect(mockReplace).toHaveBeenCalledWith('/he/weather');
    });

    it('performs change within startTransition', async () => {
        render(<LanguageSwitcher />);
        const user = userEvent.setup();

        await user.click(screen.getByRole('combobox'));
        await user.click(screen.getByText('Hebrew'));

        expect(mockStartTransition).toHaveBeenCalled();
    });

    it('does not crash if selecting the same language again', async () => {
        render(<LanguageSwitcher />);
        const user = userEvent.setup();
        await user.click(screen.getByRole('combobox'));
        await user.click(screen.getByText('Hebrew'));

        expect(mockSetLocale).toHaveBeenCalledWith('he');
        expect(mockReplace).toHaveBeenCalledWith('/he/weather');
    });
});
