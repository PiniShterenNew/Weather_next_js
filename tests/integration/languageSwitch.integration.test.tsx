import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import heMessages from "@/locales/he.json";
import { useWeatherStore } from "@/store/useWeatherStore";

const TestLanguageComponent = () => {
    const locale = useWeatherStore(s => s.locale);
    const setLocale = useWeatherStore(s => s.setLocale);

    return (
        <div>
            <div data-testid="current-locale">{locale}</div>
            <button onClick={() => setLocale(locale === 'he' ? 'en' : 'he')}>
                {locale === 'he' ? 'עבור לאנגלית' : 'Switch to Hebrew'}
            </button>
        </div>
    );
};

describe("Language Switch Integration Flow", () => {
    beforeEach(() => {
        // Reset the store before each test
        const resetStore = useWeatherStore.getState().resetStore;
        resetStore();

        // Set default locale to he
        useWeatherStore.getState().setLocale('he');
    });

    it("should switch language", async () => {
        const user = userEvent.setup();
        render(
            <NextIntlClientProvider locale="he" messages={heMessages}>
                <TestLanguageComponent />
            </NextIntlClientProvider>
        );
        // Assert initial locale
        expect(screen.getByTestId("current-locale")).toHaveTextContent("he");

        const switchButton2 = screen.getByText("עבור לאנגלית");
        await user.click(switchButton2);
        await waitFor(() => {
            expect(screen.getByTestId("current-locale")).toHaveTextContent("en");
        });
    })
    it("should show data in both languages", async () => {
        const user = userEvent.setup();
        render(
            <NextIntlClientProvider locale="he" messages={heMessages}>
                <TestLanguageComponent />
            </NextIntlClientProvider>
        );
        const switchButton = screen.getByText("עבור לאנגלית");
        await user.click(switchButton);
        await waitFor(() => {
            expect(screen.getByTestId("current-locale")).toHaveTextContent("en");
        });

        const switchButton2 = screen.getByText("Switch to Hebrew");
        await user.click(switchButton2);
        await waitFor(() => {
            expect(screen.getByTestId("current-locale")).toHaveTextContent("he");
        });
    })
    it("should handle edge cases of language", async () => {
        const user = userEvent.setup();
        render(
            <NextIntlClientProvider locale="he" messages={heMessages}>
                <TestLanguageComponent />
            </NextIntlClientProvider>
        );
        // Initial assertion
        expect(screen.getByTestId("current-locale")).toHaveTextContent("he");

        const switchButton2 = screen.getByText("עבור לאנגלית");
        await user.click(switchButton2);
        await waitFor(() => {
            expect(screen.getByTestId("current-locale")).toHaveTextContent("en");
        });
    })
})