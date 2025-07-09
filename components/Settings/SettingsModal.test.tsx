import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils/renderWithIntl';
import SettingsModal from './SettingsModal';

vi.mock('@/components/ToggleButtons/ThemeSwitcher', () => ({
  default: () => <div data-testid="theme-switcher" />,
}));
vi.mock('@/components/ToggleButtons/TempUnitToggle', () => ({
  default: () => <div data-testid="temp-toggle" />,
}));
vi.mock('@/components/ToggleButtons/LanguageSwitcher', () => ({
  default: () => <div data-testid="language-switcher" />,
}));
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    motion: {
      ...actual.motion,
      div: (props: any) => <div {...props} />,
    },
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SettingsModal', () => {
  it('renders settings button with correct label and title', () => {
    render(<SettingsModal />);
    const button = screen.getByRole('button', { name: 'Settings' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('title', 'Settings');
  });

  it('opens the modal when settings button is clicked', async () => {
    render(<SettingsModal />);
    const button = screen.getByRole('button', { name: 'Settings' });
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Theme')).toBeInTheDocument();
      expect(screen.getByText('Unit')).toBeInTheDocument();
      expect(screen.getByText('Language')).toBeInTheDocument();
    });
  });

  it('renders toggle components inside the modal', async () => {
    render(<SettingsModal />);
    const button = screen.getByRole('button', { name: 'Settings' });
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByTestId('theme-switcher')).toBeInTheDocument();
      expect(screen.getByTestId('temp-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
    });
  });
});
