import React from 'react';
import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
import { render, screen } from '@/test/utils/renderWithIntl';

vi.mock('@/components/WeatherList/WeatherList', () => ({
    __esModule: true,
    default: () => <div data-testid="weather-list" />,
}));
vi.mock('@/components/WeatherCard/CityInfo', () => ({
    __esModule: true,
    default: () => <div data-testid="city-info" />,
}));
vi.mock('@/components/EmptyPage/EmptyPage', () => ({
    __esModule: true,
    default: () => <div data-testid="weather-empty" />,
}));

vi.mock('@/components/LoadingOverlay', () => ({
    __esModule: true,
    default: ({ isLoading }: { isLoading: boolean }) => isLoading ? <div data-testid="loading-overlay" /> : null,
}));
vi.mock('@/components/QuickAdd/QuickCityAddModal', () => ({
    __esModule: true,
    QuickCityAddModal: () => <div data-testid="quick-add-modal" />,
}));
vi.mock('@/components/Settings/SettingsModal', () => ({
    __esModule: true,
    default: () => <div data-testid="settings-modal" />,
}));
vi.mock('@/components/QuickAdd/AddLocation', () => ({
    __esModule: true,
    default: () => <button data-testid="add-location" />,
}));

import HomePage from './HomePage';
import { act } from 'react';

let mockStore: Record<string, any> = {
    cities: [],
    isLoading: false,
    autoLocationCityId: null,
    showToast: vi.fn(),
};

vi.mock('@/stores/useWeatherStore', () => ({
    useWeatherStore: vi.fn((selector) => selector(mockStore)),
}));

describe('HomePage', () => {
    beforeEach(() => {
        mockStore.cities = [];
        mockStore.isLoading = false;
        mockStore.autoLocationCityId = null;
        mockStore.showToast = vi.fn();

        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    it('renders WeatherList and CityInfo when cities exist', async () => {
        mockStore.cities = [{ id: '1' }];

        render(<HomePage />);
        await act(async () => {
            vi.advanceTimersByTime(200);
        });

        expect(screen.getByTestId('weather-list')).toBeInTheDocument();
        expect(screen.getByTestId('city-info')).toBeInTheDocument();
    });

    it('renders WeatherEmpty when cities list is empty', async () => {
        render(<HomePage />);
        await act(async () => {
            vi.advanceTimersByTime(200);
        });
        expect(screen.getByTestId('weather-empty')).toBeInTheDocument();
    });

    it('shows AddLocation button when autoLocationCityId is not set', () => {
        render(<HomePage />);
        expect(screen.getByTestId('add-location')).toBeInTheDocument();
    });

    it('does not show AddLocation button when autoLocationCityId is set', () => {
        mockStore.autoLocationCityId = '123';
        render(<HomePage />);
        expect(screen.queryByTestId('add-location')).not.toBeInTheDocument();
    });

    it('shows LoadingOverlay while loading', () => {
        mockStore.isLoading = true;
        render(<HomePage />);
        expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
    });

    it('triggers slow network warning toast after 5s if still loading', () => {
        render(<HomePage />);
        vi.advanceTimersByTime(5000);
        expect(mockStore.showToast).toHaveBeenCalledWith({
            message: 'toasts.slowNetwork',
            type: 'warning',
            duration: 8000,
        });
    });

    it('does not trigger toast again after loading completes', () => {
        render(<HomePage />);
        vi.advanceTimersByTime(5100);
        mockStore.isLoading = false;
        render(<HomePage />);
        expect(mockStore.showToast).toHaveBeenCalledTimes(1);
    });
});
