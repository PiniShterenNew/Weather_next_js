import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/utils/renderWithIntl';
import LanguageSwitcher from './LanguageSwitcher';
import userEvent from '@testing-library/user-event';

const mockSetLocale = vi.fn();
const mockReplace = vi.fn();
const mockStartTransition = vi.fn(cb => cb());
const pathname = '/he/weather';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => pathname,
}));

vi.mock('react', async orig => {
  const actual = await orig<typeof import('react')>();
  return { ...actual, useTransition: () => [false, mockStartTransition] };
});

vi.mock('@/stores/useWeatherStore', () => ({
  useWeatherStore: (sel: any) => sel({ locale: 'en', setLocale: mockSetLocale }),
}));

vi.mock('next-intl', async importOriginal => {
  const actual = await importOriginal<typeof import('next-intl')>();
  return {
    ...actual,
    useLocale: () => 'he',
    useTranslations: () => (k: string) =>
      k === 'language.he' ? 'Hebrew' : k === 'language.en' ? 'English' : k,
  };
});

beforeEach(() => vi.clearAllMocks());

describe('LanguageSwitcher', () => {
  it('renders current language from store', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByText('en')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-label', 'en');
  });

  it('syncs locale from useLocale on mount', () => {
    render(<LanguageSwitcher />);
    expect(mockSetLocale).toHaveBeenCalledWith('he');
  });

  it('shows language options when opened', async () => {
    render(<LanguageSwitcher />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));

    // Radix משתמש ב-aria-label על ה-option, לכן עדיף role+name
    expect(await screen.findByRole('option', { name: 'he' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'en' })).toBeInTheDocument();
  });

  it('calls setLocale with "he" when Hebrew selected', async () => {
    render(<LanguageSwitcher />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'he' }));

    expect(mockSetLocale).toHaveBeenCalledWith('he');
  });

  it('calls router.replace with new path', async () => {
    render(<LanguageSwitcher />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'he' }));

    expect(mockReplace).toHaveBeenCalledWith('/he/weather');
  });

  it('wraps change in startTransition', async () => {
    render(<LanguageSwitcher />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'he' }));

    expect(mockStartTransition).toHaveBeenCalled();
  });
});
