import { fireEvent, render, screen, waitFor } from "@/tests/utils/renderWithIntl";
import { vi } from 'vitest';

vi.mock("@/components/QuickAdd/PopularCities", () => ({
    __esModule: true,
    default: ({ direction }: { direction: string }) => (
        <div data-testid="popular-cities">PopularCities {direction}</div>
    )
}));

vi.mock("@/features/search", () => ({
    __esModule: true,
    SearchBar: ({ onSelect }: { onSelect: () => void }) => (
        <div data-testid="search-bar">
            SearchBar
            <button onClick={onSelect}>SelectCity</button>
        </div>
    ),
    RecentSearches: ({ onSelect }: { onSelect: () => void }) => (
        <div data-testid="recent-searches">
            RecentSearches
            <button onClick={onSelect}>SelectRecent</button>
        </div>
    )
}));

const mockUseWeatherStore = {
    open: false,
    setOpen: vi.fn(),
};

vi.mock("@/store/useWeatherStore", () => ({
    useWeatherStore: (selector = (s: any) => s) => selector(mockUseWeatherStore),
}));

import { QuickCityAddModal } from "@/components/QuickAdd/QuickCityAddModal";
import userEvent from "@testing-library/user-event";
import { AppLocale } from "@/types/i18n";

beforeEach(() => {
    mockUseWeatherStore.open = false;
});

describe("QuickCityAddModal", () => {
    it("renders Weather title when modal is open", () => {
        mockUseWeatherStore.open = true;
        render(<QuickCityAddModal />);
        // Target the main h1 heading specifically
        const headings = screen.getAllByRole("heading", { name: "Weather" });
        expect(headings.length).toBeGreaterThan(0);
        expect(headings[0]).toBeInTheDocument();
    });

    it("shows all components when modal is open", () => {
        mockUseWeatherStore.open = true;
        render(<QuickCityAddModal />);
        expect(screen.getByTestId("search-bar")).toBeInTheDocument();
        expect(screen.getByTestId("recent-searches")).toBeInTheDocument();
        expect(screen.getByTestId("popular-cities")).toBeInTheDocument();
    });

    it("closes modal when city is selected in SearchBar", async () => {
        const user = userEvent.setup();
        mockUseWeatherStore.open = true;
        render(<QuickCityAddModal />);
      
        await user.click(screen.getByText("SelectCity"));
        expect(mockUseWeatherStore.setOpen).toHaveBeenCalledWith(false);
    });

    it("closes modal when recent search is selected", async () => {
        const user = userEvent.setup();
        mockUseWeatherStore.open = true;
        render(<QuickCityAddModal />);
      
        await user.click(screen.getByText("SelectRecent"));
        expect(mockUseWeatherStore.setOpen).toHaveBeenCalledWith(false);
    });
      
    it("renders dir='rtl' when locale is Hebrew", () => {
        mockUseWeatherStore.open = true;
        render(<QuickCityAddModal />, { locale: "he" as AppLocale });
      
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveAttribute("dir", "rtl");
        expect(screen.getByTestId("popular-cities").textContent).toMatch(/rtl/i);
    });
      
    it("does not render modal content when open=false", () => {
        mockUseWeatherStore.open = false;
        render(<QuickCityAddModal />);
        expect(screen.queryByTestId("popular-cities")).toBeNull();
        expect(screen.queryByTestId("search-bar")).toBeNull();
        expect(screen.queryByTestId("recent-searches")).toBeNull();
    });
});