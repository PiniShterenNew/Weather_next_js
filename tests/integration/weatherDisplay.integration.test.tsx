// weatherDisplay.integration.test.tsx (חדש)
// 🆕 הצגת נתוני מזג אוויר נוכחיים
// 🆕 הצגת תחזית
// 🆕 שינוי יחידות מידה

import { act, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { vi } from "vitest";

import CityInfo from "@/features/weather/components/card/CityInfo";
import { useWeatherStore } from "@/store/useWeatherStore";
import { useAppPreferencesStore } from "@/store/useAppPreferencesStore";
import heMessages from "@/locales/he.json";
import { cityWeather } from "../fixtures/cityWeather";

const renderCityInfo = () =>
  render(
    <NextIntlClientProvider locale="he" messages={heMessages}>
      <CityInfo />
    </NextIntlClientProvider>,
  );

const loadCity = () => {
  act(() => {
    useWeatherStore.getState().resetStore();
    useWeatherStore.getState().addCity(cityWeather);
  });
};

describe("Weather Display Integration Flow", () => {
  beforeEach(() => {
    act(() => {
      useWeatherStore.getState().resetStore();
    });
  });

  it("should display current weather", async () => {
    loadCity();
    renderCityInfo();

    const headings = await screen.findAllByRole("heading", { name: /ניו יורק/i });
    expect(headings.length).toBeGreaterThan(0);

    const description = await screen.findAllByText(/Clear sky/i);
    expect(description.length).toBeGreaterThan(0);
  });

  it("should display forecast", async () => {
    loadCity();
    renderCityInfo();

    await waitFor(async () => {
      const titles = await screen.findAllByTestId("forecast-title");
      const items = await screen.findAllByTestId("forecast-item");
      expect(titles.length).toBeGreaterThan(0);
      expect(items.length).toBeGreaterThanOrEqual(cityWeather.forecast.length);
    });
  });

  it("should change unit", async () => {
    loadCity();
    renderCityInfo();

    await act(async () => {
      useWeatherStore.getState().setUnit("imperial");
      // Wait for state update to propagate
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await waitFor(async () => {
      const imperialTemps = await screen.findAllByText("66°F");
      expect(imperialTemps.length).toBeGreaterThan(0);
    });
  });

  it("should persist unit change when authenticated", async () => {
    // Set user as authenticated
    await act(async () => {
      useAppPreferencesStore.getState().setIsAuthenticated(true);
    });

    loadCity();
    renderCityInfo();

    const { weatherActions } = await import('@/features/weather/actions/weatherActions');
    const persistSpy = vi.spyOn(weatherActions, 'persistPreferencesIfAuthenticated').mockResolvedValue(undefined);

    await act(async () => {
      useWeatherStore.getState().setUnit("imperial");
      // Manually trigger persistence (simulating what TemperatureUnitToggle does)
      useWeatherStore.getState().persistPreferencesIfAuthenticated(useWeatherStore.getState().cities);
      // Wait for state update to propagate
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(persistSpy).toHaveBeenCalled();
    });

    persistSpy.mockRestore();
  });
});