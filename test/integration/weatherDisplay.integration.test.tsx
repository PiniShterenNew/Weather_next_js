// weatherDisplay.integration.test.tsx (חדש)
// 🆕 הצגת נתוני מזג אוויר נוכחיים
// 🆕 הצגת תחזית
// 🆕 שינוי יחידות מידה

import { render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import heMessages from "@/locales/he.json";
import CityInfo from "@/components/WeatherCard/CityInfo";
import { cityWeather } from "../fixtures/cityWeather";
import { useWeatherStore } from "@/stores/useWeatherStore";

describe("Weather Display Integration Flow", () => {
    beforeEach(() => {
        const resetStore = useWeatherStore.getState().resetStore;
        resetStore();
    })
    it("should display current weather", () => {

        const addCity = useWeatherStore.getState().addCity;
        addCity(cityWeather);
        render(
            <NextIntlClientProvider locale="he" messages={heMessages}>
                <CityInfo />
            </NextIntlClientProvider>
        );
        expect(screen.getByText("ניו יורק")).toBeInTheDocument();
        expect(screen.getByText("20°C")).toBeInTheDocument();
        expect(screen.getByText("שמיים בהירים")).toBeInTheDocument();
    })
    it("should display forecast", async () => {
        const addCity = useWeatherStore.getState().addCity;
        addCity(cityWeather);
        render(
            <NextIntlClientProvider locale="he" messages={heMessages}>
                <CityInfo />
            </NextIntlClientProvider>
        );
        await waitFor(() => {
            expect(screen.getByTestId("forecast-title")).toBeInTheDocument();
            expect(screen.getAllByTestId("forecast-item")).toHaveLength(2);
        })
    })
    it("should change unit", async () => {
        const addCity = useWeatherStore.getState().addCity;
        addCity(cityWeather);
        render(
            <NextIntlClientProvider locale="he" messages={heMessages}>
                <CityInfo />
            </NextIntlClientProvider>
        );
        const changeUnit = useWeatherStore.getState().setUnit;
        changeUnit("imperial");
        await waitFor(() => {
            expect(screen.getByTestId("temperature")).toHaveTextContent("68°F");
        })
    })
})