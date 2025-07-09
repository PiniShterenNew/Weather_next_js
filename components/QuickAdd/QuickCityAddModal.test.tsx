import { fireEvent, render, screen, waitFor } from "@/test/utils/renderWithIntl";

vi.mock("@/components/QuickAdd/PopularCities", () => ({
    __esModule: true,
    default: ({ direction }: { direction: string }) => (
        <div data-testid="popular-cities">PopularCities {direction}</div>
    )
}));

vi.mock("@/components/SearchBar/SearchBar", () => ({
    __esModule: true,
    default: ({ onSelect }: { onSelect: () => void }) => (
        <div data-testid="search-bar">
            SearchBar
            <button onClick={onSelect}>SelectCity</button>
        </div>
    )
}));

const mockUseWeatherStore = {
    open: false,
    setOpen: vi.fn(),
};

vi.mock("@/stores/useWeatherStore", () => ({
    useWeatherStore: (selector = (s: any) => s) => selector(mockUseWeatherStore),
}));

import { QuickCityAddModal } from "./QuickCityAddModal";
import userEvent from "@testing-library/user-event";
import { AppLocale } from "@/types/i18n";

beforeEach(() => {
    mockUseWeatherStore.open = false;
});

describe("QuickCityAddModal", () => {
    it("renders the quick add button with correct label", () => {
        render(<QuickCityAddModal />);
        expect(screen.getByText("Quick Add")).toBeInTheDocument();
    });

    it("opens the modal when button is clicked", async () => {
        mockUseWeatherStore.open = false;
        render(<QuickCityAddModal />);
        screen.getByRole("button", { name: "Quick Add" }).click();
        expect(mockUseWeatherStore.setOpen).toHaveBeenCalledWith(true);
    });

    it("shows PopularCities tab content by default", () => {
        mockUseWeatherStore.open = true;
        render(<QuickCityAddModal />);
        expect(screen.getByTestId("popular-cities")).toBeInTheDocument();
    });

    it("switches to SearchBar tab when search tab is clicked", async () => {
        const user = userEvent.setup();

        const { rerender } = render(<QuickCityAddModal />);

        await user.click(screen.getByTestId("quick-add-button"));
        expect(mockUseWeatherStore.setOpen).toHaveBeenCalledWith(true);

        mockUseWeatherStore.open = true;
        rerender(<QuickCityAddModal />);

        await screen.findByTestId("popular-cities");
        await user.click(screen.getByTestId("tab-search"));
        await screen.findByTestId("search-bar");
    });

    it("closes modal when city is selected in SearchBar", async () => {
        const user = userEvent.setup();
        const { rerender } = render(<QuickCityAddModal />);
      
        await user.click(screen.getByTestId("quick-add-button"));
        mockUseWeatherStore.open = true;
        rerender(<QuickCityAddModal />);
      
        await user.click(screen.getByTestId("tab-search"));
        await screen.findByTestId("search-bar");
      
        await user.click(screen.getByText("SelectCity"));
        expect(mockUseWeatherStore.setOpen).toHaveBeenCalledWith(false);
      });
      
      it("renders dir='rtl' when locale is Hebrew", () => {
        mockUseWeatherStore.open = true;
        render(<QuickCityAddModal />, { locale: "he" as AppLocale });
      
        const rtlList = screen
          .getAllByRole("tablist")
          .find((el) => el.getAttribute("dir") === "rtl");
      
        expect(rtlList).toBeDefined();
        expect(rtlList).toHaveAttribute("dir", "rtl");
        expect(screen.getByTestId("popular-cities").textContent).toMatch(/rtl/i);
      });
      
      it("can switch back to Popular tab", async () => {
        const user = userEvent.setup();
        const { rerender } = render(<QuickCityAddModal />);
      
        await user.click(screen.getByTestId("quick-add-button"));
        mockUseWeatherStore.open = true;
        rerender(<QuickCityAddModal />);
      
        await user.click(screen.getByTestId("tab-search"));
        await screen.findByTestId("search-bar");
      
        await user.click(screen.getByTestId("tab-popular"));
        await screen.findByTestId("popular-cities");
        expect(screen.queryByTestId("search-bar")).not.toBeInTheDocument();
      });
      
      it("does not render modal content when open=false", () => {
        mockUseWeatherStore.open = false;
        render(<QuickCityAddModal />);
        expect(screen.queryByTestId("popular-cities")).toBeNull();
        expect(screen.queryByTestId("search-bar")).toBeNull();
      });
});