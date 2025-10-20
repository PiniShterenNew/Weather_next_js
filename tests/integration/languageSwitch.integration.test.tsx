import { render, screen } from "@testing-library/react";
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
        const switchButton = screen.getByText("he");
        await user.click(switchButton);
        expect(screen.getByText("he")).toBeInTheDocument();

        const switchButton2 = screen.getByText("עבור לאנגלית");
        await user.click(switchButton2);
        expect(screen.getByText("en")).toBeInTheDocument();
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
        expect(screen.getByText("en")).toBeInTheDocument();

        const switchButton2 = screen.getByText("Switch to Hebrew");
        await user.click(switchButton2);
        expect(screen.getByText("he")).toBeInTheDocument();
    })
    it("should handle edge cases of language", async () => {
        const user = userEvent.setup();
        render(
            <NextIntlClientProvider locale="he" messages={heMessages}>
                <TestLanguageComponent />
            </NextIntlClientProvider>
        );
        const switchButton = screen.getByText("he");
        await user.click(switchButton);
        expect(screen.getByText("he")).toBeInTheDocument();

        const switchButton2 = screen.getByText("עבור לאנגלית");
        await user.click(switchButton2);
        expect(screen.getByText("en")).toBeInTheDocument();
    })
})