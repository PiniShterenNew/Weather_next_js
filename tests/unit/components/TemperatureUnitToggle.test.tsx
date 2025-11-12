import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import TemperatureUnitToggle from '@/features/settings/components/TemperatureUnitToggle';
import { useWeatherStore } from '@/store/useWeatherStore';
import { useAppPreferencesStore } from '@/store/useAppPreferencesStore';
import { cityWeather } from '@/tests/fixtures/cityWeather';
import heMessages from '@/locales/he.json';

// Mock the store
const mockSetUnit = vi.fn();
const mockPersistPreferencesIfAuthenticated = vi.fn().mockResolvedValue(undefined);
const mockShowToast = vi.fn();

const mockStoreState = {
  unit: 'metric',
  cities: [cityWeather],
  setUnit: mockSetUnit,
  persistPreferencesIfAuthenticated: mockPersistPreferencesIfAuthenticated,
  showToast: mockShowToast,
};

vi.mock('@/store/useWeatherStore', () => {
  const mockUseWeatherStore = (selector: any = (s: any) => s) => selector(mockStoreState);
  mockUseWeatherStore.getState = () => mockStoreState;
  return {
    useWeatherStore: mockUseWeatherStore,
  };
});

describe('TemperatureUnitToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreState.unit = 'metric';
    mockStoreState.cities = [cityWeather];
    mockPersistPreferencesIfAuthenticated.mockResolvedValue(undefined);
    useAppPreferencesStore.setState({
      unit: 'metric',
      isAuthenticated: true,
    });
  });

  it('should render both unit buttons', () => {
    render(
      <NextIntlClientProvider locale="he" messages={heMessages}>
        <TemperatureUnitToggle />
      </NextIntlClientProvider>
    );

    const celsiusButton = screen.getByLabelText('°C');
    const fahrenheitButton = screen.getByLabelText('°F');

    expect(celsiusButton).toBeInTheDocument();
    expect(fahrenheitButton).toBeInTheDocument();
  });

  it('should call setUnit when clicking on a different unit', async () => {
    render(
      <NextIntlClientProvider locale="he" messages={heMessages}>
        <TemperatureUnitToggle />
      </NextIntlClientProvider>
    );

    const fahrenheitButton = screen.getByLabelText('°F');
    fireEvent.click(fahrenheitButton);

    await waitFor(() => {
      expect(mockSetUnit).toHaveBeenCalledWith('imperial');
    });
  });

  it('should call persistPreferencesIfAuthenticated when unit changes and user is authenticated', async () => {
    useAppPreferencesStore.setState({ isAuthenticated: true });

    render(
      <NextIntlClientProvider locale="he" messages={heMessages}>
        <TemperatureUnitToggle />
      </NextIntlClientProvider>
    );

    const fahrenheitButton = screen.getByLabelText('°F');
    fireEvent.click(fahrenheitButton);

    await waitFor(() => {
      expect(mockPersistPreferencesIfAuthenticated).toHaveBeenCalledWith([cityWeather]);
    });
  });

  it('should show toast notification when unit changes', async () => {
    render(
      <NextIntlClientProvider locale="he" messages={heMessages}>
        <TemperatureUnitToggle />
      </NextIntlClientProvider>
    );

    const fahrenheitButton = screen.getByLabelText('°F');
    fireEvent.click(fahrenheitButton);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith({
        message: 'settings.unitChanged',
        type: 'success',
        values: { unit: '°F' },
      });
    });
  });

  it('should not call persistPreferencesIfAuthenticated when unit is already set', async () => {
    mockStoreState.unit = 'imperial';

    render(
      <NextIntlClientProvider locale="he" messages={heMessages}>
        <TemperatureUnitToggle />
      </NextIntlClientProvider>
    );

    const fahrenheitButton = screen.getByLabelText('°F');
    fireEvent.click(fahrenheitButton);

    await waitFor(() => {
      expect(mockSetUnit).not.toHaveBeenCalled();
      expect(mockPersistPreferencesIfAuthenticated).not.toHaveBeenCalled();
    });
  });

  it('should handle persistence errors gracefully', async () => {
    mockPersistPreferencesIfAuthenticated.mockRejectedValueOnce(new Error('Network error'));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <NextIntlClientProvider locale="he" messages={heMessages}>
        <TemperatureUnitToggle />
      </NextIntlClientProvider>
    );

    const fahrenheitButton = screen.getByLabelText('°F');
    fireEvent.click(fahrenheitButton);

    await waitFor(() => {
      expect(mockSetUnit).toHaveBeenCalledWith('imperial');
      expect(mockShowToast).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to persist unit preference:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });
});

