// locationRefresh.integration.test.tsx
// 🆕 בדיקת ריענון מיקום

import { act, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { vi } from "vitest";
import { useRouter } from "next/navigation";

import { useWeatherStore } from "@/store/useWeatherStore";
import { useAppPreferencesStore } from "@/store/useAppPreferencesStore";
import { useLocationStore } from "@/features/location/store/useLocationStore";
import { useWeatherDataStore } from "@/features/weather/store/useWeatherDataStore";
import heMessages from "@/locales/he.json";
import { cityWeather } from "../fixtures/cityWeather";
import { fetchWeather } from "@/features/weather";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    refresh: vi.fn(),
    push: vi.fn(),
  })),
}));

// Mock fetchSecure
vi.mock("@/lib/fetchSecure", () => ({
  fetchSecure: vi.fn(),
}));

// Mock fetchWeather
vi.mock("@/features/weather", () => ({
  fetchWeather: vi.fn(),
}));

// Mock geolocation - must be defined before any imports that use it
const mockGetCurrentPosition = vi.fn();

Object.defineProperty(global.navigator, "geolocation", {
  value: {
    getCurrentPosition: mockGetCurrentPosition,
  },
  writable: true,
  configurable: true,
});

// Note: useLocationRefresh is mocked in tests/setup.ts, but we need the actual implementation here
// Override the mock with the actual implementation by re-mocking it
vi.mock("@/features/location/hooks/useLocationRefresh", async () => {
  const actual = await vi.importActual<typeof import("@/features/location/hooks/useLocationRefresh")>("@/features/location/hooks/useLocationRefresh");
  return actual;
});

// Import after re-mocking
import { useLocationRefresh } from "@/features/location/hooks/useLocationRefresh";

// Test component that uses useLocationRefresh directly
function TestComponent() {
  const { handleRefreshLocation, isRefreshingLocation } = useLocationRefresh();
  
  return (
    <div>
      <button onClick={handleRefreshLocation} disabled={isRefreshingLocation}>
        Refresh Location
      </button>
      {isRefreshingLocation && <div data-testid="refreshing">Refreshing...</div>}
    </div>
  );
}

describe("Location Refresh Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    act(() => {
      useWeatherStore.getState().resetStore();
      useAppPreferencesStore.setState({ unit: "metric", locale: "he" });
      useLocationStore.getState().resetLocationState();
    });
  });

  it("should show correct city name in toast when location is refreshed", async () => {
    const mockReverseResponse = {
      id: "city:31.8_34.6",
      lat: 31.7828493,
      lon: 34.6326132,
      city: { en: "Ashdod", he: "אשדוד" },
      country: { en: "Israel", he: "ישראל" },
    };

    const mockWeatherData = {
      ...cityWeather,
      id: "city:31.8_34.6",
      name: { en: "Ashdod", he: "אשדוד" },
      country: { en: "Israel", he: "ישראל" },
      lat: 31.7828493,
      lon: 34.6326132,
    };

    const { fetchSecure } = await import("@/lib/fetchSecure");
    (fetchSecure as any).mockResolvedValue({
      ok: true,
      json: async () => mockReverseResponse,
    });

    (fetchWeather as any).mockResolvedValue(mockWeatherData);

    mockGetCurrentPosition.mockImplementation((success, error, options) => {
      // Call success callback immediately (synchronously) for testing
      if (success) {
        success({
          coords: {
            latitude: 31.7828493,
            longitude: 34.6326132,
            accuracy: 10,
          },
          timestamp: Date.now(),
        });
      }
    });

    render(
      <NextIntlClientProvider locale="he" messages={heMessages}>
        <TestComponent />
      </NextIntlClientProvider>
    );

    const refreshButton = screen.getByText("Refresh Location");
    
    // Click the button - this should trigger getCurrentPosition
    await act(async () => {
      refreshButton.click();
      // Wait a bit for the async callback to execute
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    await waitFor(() => {
      const toasts = useWeatherStore.getState().toasts;
      const locationToast = toasts.find((t) => t.message === "toasts.locationUpdated");
      expect(locationToast).toBeDefined();
      expect(locationToast?.values?.city).toBe("אשדוד");
    }, { timeout: 5000 });
  });

  it("should update current location city in store when location is refreshed", async () => {
    // Set up initial state with New York as current location
    const newYorkCity = {
      ...cityWeather,
      id: "city:40.7_-74.0",
      name: { en: "New York", he: "ניו יורק" },
      isCurrentLocation: true,
    };

    act(() => {
      useWeatherStore.getState().resetStore();
      useWeatherDataStore.getState().addOrReplaceCurrentLocation(newYorkCity);
      useAppPreferencesStore.setState({ isAuthenticated: true });
    });

    const mockReverseResponse = {
      id: "city:31.8_34.6",
      lat: 31.7828493,
      lon: 34.6326132,
      city: { en: "Ashdod", he: "אשדוד" },
      country: { en: "Israel", he: "ישראל" },
    };

    const mockWeatherData = {
      ...cityWeather,
      id: "city:31.8_34.6",
      name: { en: "Ashdod", he: "אשדוד" },
      country: { en: "Israel", he: "ישראל" },
      lat: 31.7828493,
      lon: 34.6326132,
    };

    const { fetchSecure } = await import("@/lib/fetchSecure");
    (fetchSecure as any).mockResolvedValue({
      ok: true,
      json: async () => mockReverseResponse,
    });

    (fetchWeather as any).mockResolvedValue(mockWeatherData);

    mockGetCurrentPosition.mockImplementation((success, error, options) => {
      // Call success callback immediately (synchronously) for testing
      if (success) {
        success({
          coords: {
            latitude: 31.7828493,
            longitude: 34.6326132,
            accuracy: 10,
          },
          timestamp: Date.now(),
        });
      }
    });

    render(
      <NextIntlClientProvider locale="he" messages={heMessages}>
        <TestComponent />
      </NextIntlClientProvider>
    );

    const refreshButton = screen.getByText("Refresh Location");
    
    // Click the button - this should trigger getCurrentPosition
    await act(async () => {
      refreshButton.click();
      // Wait a bit for the async callback to execute
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    await waitFor(() => {
      const cities = useWeatherStore.getState().cities;
      const currentLocationCity = cities.find((c) => c.isCurrentLocation);
      const currentIndex = useWeatherStore.getState().currentIndex;
      
      // Verify new city is current location
      expect(currentLocationCity).toBeDefined();
      expect(currentLocationCity?.name.he).toBe("אשדוד");
      expect(currentLocationCity?.id).toBe("city:31.8_34.6");
      
      // Verify currentIndex is 0 (new city should be first)
      expect(currentIndex).toBe(0);
      expect(cities[currentIndex]?.id).toBe("city:31.8_34.6");
      
      // Verify old city (New York) is no longer current location
      const oldCity = cities.find((c) => c.id === "city:40.7_-74.0");
      if (oldCity) {
        expect(oldCity.isCurrentLocation).toBe(false);
      }
    }, { timeout: 5000 });
  });

  it("should persist location change to server when authenticated", async () => {
    const mockReverseResponse = {
      id: "city:31.8_34.6",
      lat: 31.7828493,
      lon: 34.6326132,
      city: { en: "Ashdod", he: "אשדוד" },
      country: { en: "Israel", he: "ישראל" },
    };

    const mockWeatherData = {
      ...cityWeather,
      id: "city:31.8_34.6",
      name: { en: "Ashdod", he: "אשדוד" },
      country: { en: "Israel", he: "ישראל" },
      lat: 31.7828493,
      lon: 34.6326132,
    };

    const { fetchSecure } = await import("@/lib/fetchSecure");
    (fetchSecure as any).mockResolvedValue({
      ok: true,
      json: async () => mockReverseResponse,
    });

    (fetchWeather as any).mockResolvedValue(mockWeatherData);

    // Mock weatherPersistenceService to verify persistence is called
    const weatherPersistenceService = await import('@/features/weather/services/weatherPersistenceService');
    const persistSpy = vi.spyOn(weatherPersistenceService.weatherPersistenceService, 'persistUserPreferences').mockResolvedValue(undefined);

    act(() => {
      useAppPreferencesStore.setState({ isAuthenticated: true });
    });

    mockGetCurrentPosition.mockImplementation((success, error, options) => {
      // Call success callback immediately (synchronously) for testing
      if (success) {
        success({
          coords: {
            latitude: 31.7828493,
            longitude: 34.6326132,
            accuracy: 10,
          },
          timestamp: Date.now(),
        });
      }
    });

    render(
      <NextIntlClientProvider locale="he" messages={heMessages}>
        <TestComponent />
      </NextIntlClientProvider>
    );

    const refreshButton = screen.getByText("Refresh Location");
    
    // Click the button - this should trigger getCurrentPosition
    await act(async () => {
      refreshButton.click();
      // Wait a bit for the async callback to execute
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    await waitFor(() => {
      // Verify persistence was called with updated cities
      expect(persistSpy).toHaveBeenCalled();
      const persistCall = persistSpy.mock.calls[0]?.[0];
      expect(persistCall).toBeDefined();
      expect(persistCall.cities).toBeDefined();
      expect(Array.isArray(persistCall.cities)).toBe(true);
      
      // Verify the new city is in the persisted data
      const persistedCity = persistCall.cities.find((c: any) => c.id === "city:31.8_34.6");
      expect(persistedCity).toBeDefined();
      expect(persistedCity?.isCurrentLocation).toBe(true);
    }, { timeout: 5000 });

    persistSpy.mockRestore();
  });

  it("should handle API response with city object structure correctly", async () => {
    const mockReverseResponse = {
      id: "city:31.8_34.6",
      lat: 31.7828493,
      lon: 34.6326132,
      city: { en: "Ashdod", he: "אשדוד" }, // Correct structure
      country: { en: "Israel", he: "ישראל" },
    };

    const { fetchSecure } = await import("@/lib/fetchSecure");
    (fetchSecure as any).mockResolvedValue({
      ok: true,
      json: async () => mockReverseResponse,
    });

    mockGetCurrentPosition.mockImplementation((success, error, options) => {
      // Call success callback immediately (synchronously) for testing
      if (success) {
        success({
          coords: {
            latitude: 31.7828493,
            longitude: 34.6326132,
            accuracy: 10,
          },
          timestamp: Date.now(),
        });
      }
    });

    render(
      <NextIntlClientProvider locale="he" messages={heMessages}>
        <TestComponent />
      </NextIntlClientProvider>
    );

    const refreshButton = screen.getByText("Refresh Location");
    
    // Click the button - this should trigger getCurrentPosition
    await act(async () => {
      refreshButton.click();
      // Wait a bit for the async callback to execute
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    await waitFor(() => {
      // Verify that fetchSecure was called correctly
      expect(fetchSecure).toHaveBeenCalledWith(
        expect.stringContaining("/api/reverse"),
        expect.any(Object)
      );
    }, { timeout: 5000 });
  });
});

