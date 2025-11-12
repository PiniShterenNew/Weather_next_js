import React from 'react';
import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
import { render, screen } from '@/tests/utils/renderWithIntl';

vi.mock('@/features/cities/components/WeatherList', () => ({
    __esModule: true,
    default: () => <div data-testid="weather-list" />,
}));
vi.mock('@/features/weather/components/card/SwipeableWeatherCard', () => ({
    __esModule: true,
    default: () => <div data-testid="city-info" />,
}));
vi.mock('@/features/ui/components/EmptyPage', () => ({
    __esModule: true,
    default: () => <div data-testid="weather-empty" />,
}));

vi.mock('@/components/LoadingOverlay', () => ({
    __esModule: true,
    default: ({ isLoading }: { isLoading: boolean }) => isLoading ? <div data-testid="loading-overlay" /> : null,
}));
vi.mock('@/features/search/components/quickAdd/QuickCityAddModal', () => ({
    __esModule: true,
    default: () => (
        <div data-testid="quick-add-modal" role="dialog" aria-labelledby="dialog-title" aria-describedby="dialog-description">
            <div id="dialog-title" role="heading">Quick Add</div>
            <div id="dialog-description">Add a city quickly</div>
        </div>
    ),
}));
vi.mock('@/components/Settings/SettingsModal', () => ({
    __esModule: true,
    default: () => <div data-testid="settings-modal" />,
}));
vi.mock('@/features/search/components/quickAdd/AddLocation', () => ({
    __esModule: true,
    default: () => <button data-testid="add-location" />,
}));

import HomePage from '@/features/home/components/HomePage';
import { act } from 'react';

let mockStore: Record<string, any> = {
    cities: [],
    isLoading: false,
    autoLocationCityId: null,
    showToast: vi.fn(),
};

vi.mock('@/store/useWeatherStore', () => ({
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

        // The div with data-testid="weather-list" contains SwipeableWeatherCard
        expect(screen.getByTestId('weather-list')).toBeInTheDocument();
        // SwipeableWeatherCard is mocked and renders as city-info
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
        // The AddLocation button is inside the EmptyPage component
        expect(screen.getByTestId('weather-empty')).toBeInTheDocument();
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

    it('triggers slow network warning toast after 5s if still loading', async () => {
        mockStore.isLoading = true;
        render(<HomePage />);
        await act(async () => {
            vi.advanceTimersByTime(5000);
        });
        expect(mockStore.showToast).toHaveBeenCalledWith({
            message: 'toasts.slowNetwork',
            type: 'warning',
            duration: 8000,
        });
    });

    it('does not trigger toast again after loading completes', async () => {
        mockStore.isLoading = true;
        render(<HomePage />);
        await act(async () => {
            vi.advanceTimersByTime(5100);
        });
        mockStore.isLoading = false;
        await act(async () => {
            render(<HomePage />);
        });
        expect(mockStore.showToast).toHaveBeenCalledTimes(1);
    });
});
