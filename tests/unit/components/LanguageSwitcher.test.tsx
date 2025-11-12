import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@/tests/utils/renderWithIntl';
import userEvent from '@testing-library/user-event';
import LanguageSwitcher from '@/features/settings/components/LanguageSwitcher';
import { useWeatherStore } from '@/store/useWeatherStore';
import { useAppPreferencesStore } from '@/store/useAppPreferencesStore';
import { useToastStore } from '@/features/ui/store/useToastStore';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: vi.fn(),
  }),
  usePathname: () => '/en',
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useWeatherStore.setState({ locale: 'en' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders language selector', () => {
    render(<LanguageSwitcher />);
    const selector = screen.getByRole('combobox');
    expect(selector).toBeInTheDocument();
  });

  it('displays current locale', async () => {
    useWeatherStore.setState({ locale: 'en' });
    render(<LanguageSwitcher />, { locale: 'en' });
    
    await waitFor(() => {
      const selector = screen.getByRole('combobox');
      expect(selector).toHaveTextContent(/english/i);
    });
  });

  it('displays Hebrew when locale is Hebrew', async () => {
    useWeatherStore.setState({ locale: 'he' });
    render(<LanguageSwitcher />, { locale: 'he' });
    
    await waitFor(() => {
      const selector = screen.getByRole('combobox');
      expect(selector).toHaveTextContent(/עברית/i);
    });
  });

  it('calls setLocale when language is changed', async () => {
    const user = userEvent.setup();
    useWeatherStore.setState({ locale: 'en' });
    const setLocaleSpy = vi.spyOn(useAppPreferencesStore.getState(), 'setLocale');
    
    render(<LanguageSwitcher />, { locale: 'en' });
    
    const selector = screen.getByRole('combobox');
    await user.click(selector);
    
    // Wait for dropdown to appear
    await waitFor(() => {
      const hebrewOption = screen.getByText(/עברית/i);
      expect(hebrewOption).toBeInTheDocument();
    });
    
    const hebrewOption = screen.getByText(/עברית/i);
    await user.click(hebrewOption);
    
    await waitFor(() => {
      expect(setLocaleSpy).toHaveBeenCalledWith('he');
    });
    
    setLocaleSpy.mockRestore();
  });

  it('shows toast notification when language changes', async () => {
    const user = userEvent.setup();
    useWeatherStore.setState({ locale: 'en' });
    const showToastSpy = vi.spyOn(useToastStore.getState(), 'showToast');
    
    render(<LanguageSwitcher />, { locale: 'en' });
    
    const selector = screen.getByRole('combobox');
    await user.click(selector);
    
    await waitFor(() => {
      const hebrewOption = screen.getByText(/עברית/i);
      expect(hebrewOption).toBeInTheDocument();
    });
    
    const hebrewOption = screen.getByText(/עברית/i);
    await user.click(hebrewOption);
    
    await waitFor(() => {
      expect(showToastSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'settings.languageChanged',
          type: 'success',
        })
      );
    });
    
    showToastSpy.mockRestore();
  });

  it('does not change locale if same locale is selected', async () => {
    const user = userEvent.setup();
    useWeatherStore.setState({ locale: 'en' });
    const setLocaleSpy = vi.spyOn(useAppPreferencesStore.getState(), 'setLocale');
    
    render(<LanguageSwitcher />, { locale: 'en' });
    
    // Wait for useLayoutEffect to complete and clear its calls
    await waitFor(() => {
      // useLayoutEffect may call setLocale, wait for it to finish
    }, { timeout: 100 });
    
    // Clear calls from useLayoutEffect - we only care about calls from handleLocaleChange
    const initialCallCount = setLocaleSpy.mock.calls.length;
    setLocaleSpy.mockClear();
    
    const selector = screen.getByRole('combobox');
    await user.click(selector);
    
    await waitFor(() => {
      // Use getAllByText to handle multiple "English" elements (trigger and option)
      const englishOptions = screen.getAllByText(/english/i);
      expect(englishOptions.length).toBeGreaterThan(0);
    });
    
    // Find the option (not the trigger) - it should be in a role="option"
    const englishOptions = screen.getAllByText(/english/i);
    const englishOption = englishOptions.find(el => el.closest('[role="option"]'));
    
    if (englishOption) {
      await user.click(englishOption);
    }
    
    // Wait a bit for any async operations
    await waitFor(() => {
      // handleLocaleChange checks if newLocale === localeStore, so it should not call setLocale
      // The component has a guard: if (newLocale === localeStore) return;
      // So setLocale should not be called from handleLocaleChange
      expect(setLocaleSpy).not.toHaveBeenCalled();
    }, { timeout: 500 });
    
    setLocaleSpy.mockRestore();
  });

  it('syncs with store locale on mount', async () => {
    useWeatherStore.setState({ locale: 'he' });
    render(<LanguageSwitcher />, { locale: 'he' });
    
    await waitFor(() => {
      const selector = screen.getByRole('combobox');
      expect(selector).toHaveTextContent(/עברית/i);
    });
  });
});

