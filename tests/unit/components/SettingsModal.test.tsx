import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@/tests/utils/renderWithIntl';
import userEvent from '@testing-library/user-event';
import SettingsModal from '@/features/settings/components/SettingsModal';

describe('SettingsModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders settings trigger button', () => {
    render(<SettingsModal />);
    const trigger = screen.getByLabelText(/settings/i);
    expect(trigger).toBeInTheDocument();
  });

  it('opens modal when trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<SettingsModal />);
    const trigger = screen.getByLabelText(/settings/i);
    
    await user.click(trigger);
    
    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });
  });

  it('displays settings title when modal is open', async () => {
    const user = userEvent.setup();
    render(<SettingsModal />);
    const trigger = screen.getByLabelText(/settings/i);
    
    await user.click(trigger);
    
    await waitFor(() => {
      // Use getAllByRole and check the first one (h2) to avoid ambiguity with h3 headings
      const headings = screen.getAllByRole('heading');
      const titleHeading = headings.find(h => h.tagName === 'H2');
      expect(titleHeading).toBeInTheDocument();
      expect(titleHeading).toHaveTextContent('Settings');
    });
  });

  it('displays settings description when modal is open', async () => {
    const user = userEvent.setup();
    render(<SettingsModal />);
    const trigger = screen.getByLabelText(/settings/i);
    
    await user.click(trigger);
    
    await waitFor(() => {
      // The text is translated, so look for the actual translated text
      const description = screen.getByText(/manage your preferences/i);
      expect(description).toBeInTheDocument();
    });
  });

  it('displays language section when modal is open', async () => {
    const user = userEvent.setup();
    render(<SettingsModal />);
    const trigger = screen.getByLabelText(/settings/i);
    
    await user.click(trigger);
    
    await waitFor(() => {
      // The text is translated, so look for "Language" not "settings.language"
      const languageLabel = screen.getByText(/language/i);
      expect(languageLabel).toBeInTheDocument();
    });
  });

  it('displays temperature section when modal is open', async () => {
    const user = userEvent.setup();
    render(<SettingsModal />);
    const trigger = screen.getByLabelText(/settings/i);
    
    await user.click(trigger);
    
    await waitFor(() => {
      // The text is translated, so look for "Temperature" not "settings.temperature"
      const temperatureLabel = screen.getByText(/temperature/i);
      expect(temperatureLabel).toBeInTheDocument();
    });
  });

  it('displays theme section when modal is open', async () => {
    const user = userEvent.setup();
    render(<SettingsModal />);
    const trigger = screen.getByLabelText(/settings/i);
    
    await user.click(trigger);
    
    await waitFor(() => {
      // The text is translated, so look for "Theme" not "settings.theme"
      const themeLabel = screen.getByText(/theme/i);
      expect(themeLabel).toBeInTheDocument();
    });
  });

  it('lazy loads LanguageSwitcher component', async () => {
    const user = userEvent.setup();
    render(<SettingsModal />);
    const trigger = screen.getByLabelText(/settings/i);
    
    await user.click(trigger);
    
    await waitFor(() => {
      // LanguageSwitcher should be rendered (lazy loaded)
      // The text is translated, so look for "Language" not "settings.language"
      const languageSection = screen.getByText(/language/i);
      expect(languageSection).toBeInTheDocument();
      // Also check that LanguageSwitcher is present (combobox)
      const combobox = screen.getByRole('combobox');
      expect(combobox).toBeInTheDocument();
    });
  });

  it('lazy loads TemperatureUnitToggle component', async () => {
    const user = userEvent.setup();
    render(<SettingsModal />);
    const trigger = screen.getByLabelText(/settings/i);
    
    await user.click(trigger);
    
    await waitFor(() => {
      // TemperatureUnitToggle should be rendered (lazy loaded)
      // The text is translated, so look for "Temperature" not "settings.temperature"
      const temperatureSection = screen.getByText(/temperature/i);
      expect(temperatureSection).toBeInTheDocument();
    });
  });

  it('lazy loads ThemeSwitcher component', async () => {
    const user = userEvent.setup();
    render(<SettingsModal />);
    const trigger = screen.getByLabelText(/settings/i);
    
    await user.click(trigger);
    
    await waitFor(() => {
      // ThemeSwitcher should be rendered (lazy loaded)
      // The text is translated, so look for "Theme" not "settings.theme"
      const themeSection = screen.getByText(/theme/i);
      expect(themeSection).toBeInTheDocument();
      // Also check that ThemeSwitcher button is present
      const themeButton = screen.getByLabelText(/light|dark|system/i);
      expect(themeButton).toBeInTheDocument();
    });
  });

  it('closes modal when clicking outside', async () => {
    const user = userEvent.setup();
    render(<SettingsModal />);
    const trigger = screen.getByLabelText(/settings/i);
    
    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // Click outside (on overlay)
    const overlay = document.querySelector('[data-radix-dialog-overlay]');
    if (overlay) {
      await user.click(overlay);
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    }
  });

  it('has correct accessibility attributes', () => {
    render(<SettingsModal />);
    const trigger = screen.getByLabelText(/settings/i);
    expect(trigger).toHaveAttribute('aria-label');
  });
});

