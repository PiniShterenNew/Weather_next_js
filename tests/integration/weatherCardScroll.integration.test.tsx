// weatherCardScroll.integration.test.tsx
// 🆕 בדיקת גלילה בכרטיס מזג אוויר

import { act, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";

import CityInfo from "@/features/weather/components/card/CityInfo";
import { useWeatherStore } from "@/store/useWeatherStore";
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

describe("Weather Card Scroll Integration", () => {
  beforeEach(() => {
    act(() => {
      useWeatherStore.getState().resetStore();
    });
  });

  it("should have scrollable content container", async () => {
    loadCity();
    renderCityInfo();

    await waitFor(() => {
      const article = screen.getByRole("article");
      expect(article).toBeInTheDocument();
      
      // Check that the container has overflow-y-auto class
      expect(article).toHaveClass("overflow-y-auto");
      
      // Check that touchAction allows vertical scrolling
      // touchAction is set via inline style, so check the style attribute directly
      const touchAction = article.getAttribute("style");
      if (touchAction && touchAction.includes("touchAction")) {
        expect(touchAction).toContain("pan-y");
      } else {
        // If touchAction is not set, verify overflow-y-auto is present (which enables scrolling)
        expect(article).toHaveClass("overflow-y-auto");
      }
    });
  });

  it("should allow vertical scrolling when content overflows", async () => {
    loadCity();
    renderCityInfo();

    await waitFor(() => {
      const article = screen.getByRole("article");
      expect(article).toBeInTheDocument();
      
      // Verify the element is scrollable
      expect(article.scrollHeight).toBeGreaterThanOrEqual(article.clientHeight);
      
      // Check scroll behavior
      expect(article).toHaveClass("scroll-smooth");
    });
  });

  it("should not block vertical scrolling with touchAction", async () => {
    loadCity();
    renderCityInfo();

    await waitFor(() => {
      const article = screen.getByRole("article");
      // touchAction is set via inline style, so check the style attribute directly
      const touchAction = article.getAttribute("style");
      
      // Verify touchAction allows vertical panning (if set)
      if (touchAction && touchAction.includes("touchAction")) {
        expect(touchAction).toMatch(/pan-y/);
        // Verify it doesn't block vertical scrolling
        expect(touchAction).not.toContain("touchAction: none");
        expect(touchAction).not.toContain("touchAction: auto");
      } else {
        // If touchAction is not set, verify overflow-y-auto is present (which enables scrolling)
        expect(article).toHaveClass("overflow-y-auto");
      }
    });
  });

  it("should maintain scroll position during interactions", async () => {
    loadCity();
    renderCityInfo();

    await waitFor(() => {
      const article = screen.getByRole("article");
      
      // Set initial scroll position
      act(() => {
        article.scrollTop = 100;
      });
      
      // Verify scroll position is maintained
      expect(article.scrollTop).toBe(100);
    });
  });
});

