import { act, render, screen, waitFor } from "@/tests/utils/renderWithIntl";
import { vi } from 'vitest';
import userEvent from "@testing-library/user-event";

vi.mock("@/features/search/components/quickAdd/PopularCities", () => ({
    __esModule: true,
    default: ({ direction }: { direction: string }) => (
        <div data-testid="popular-cities">PopularCities {direction}</div>
    )
}));

vi.mock("@/features/search/components/SearchBar", () => ({
    __esModule: true,
    default: ({ onSelect }: { onSelect: () => void }) => (
        <div data-testid="search-bar">
            SearchBar
            <button onClick={onSelect}>SelectCity</button>
        </div>
    )
}));

vi.mock("@/features/search/components/RecentSearches", () => ({
    __esModule: true,
    RecentSearches: ({ onSelect }: { onSelect: () => void }) => (
        <div data-testid="recent-searches">
            RecentSearches
            <button onClick={onSelect}>SelectRecent</button>
        </div>
    ),
}));

vi.mock("@/features/search/components/quickAdd/AddLocation", () => ({
    __esModule: true,
    default: () => <div data-testid="add-location">AddLocation</div>,
}));

import QuickCityAddModal from "@/features/search/components/quickAdd/QuickCityAddModal";
import { useQuickAddStore } from "@/features/search/store/useQuickAddStore";

beforeEach(() => {
    useQuickAddStore.setState({ isOpen: false });
});

const openModal = () => {
    act(() => {
        useQuickAddStore.setState({ isOpen: true });
    });
};

describe("QuickCityAddModal", () => {
    it("renders Weather title when modal is open", () => {
        openModal();
        render(<QuickCityAddModal />);
        const headings = screen.getAllByRole("heading", { name: "Quick Add" });
        expect(headings.length).toBeGreaterThan(0);
    });

    it("links dialog title and description for accessibility", () => {
        openModal();
        render(<QuickCityAddModal />);

        const dialog = screen.getByRole("dialog");
        const labelledBy = dialog.getAttribute("aria-labelledby");
        const describedBy = dialog.getAttribute("aria-describedby");

        expect(labelledBy).toBeTruthy();
        expect(describedBy).toBeTruthy();

        const title = screen.getByRole("heading", { name: "Quick Add" });
        const description = screen.getByText("Add a city quickly");

        expect(title).toHaveAttribute("id", labelledBy || "");
        expect(description).toHaveAttribute("id", describedBy || "");
    });

    it("shows all components when modal is open", () => {
        openModal();
        render(<QuickCityAddModal />);
        expect(screen.getByTestId("search-bar")).toBeInTheDocument();
        expect(screen.getByTestId("recent-searches")).toBeInTheDocument();
        expect(screen.getByTestId("popular-cities")).toBeInTheDocument();
        expect(screen.getByTestId("add-location")).toBeInTheDocument();
    });

    it("closes modal when city is selected in SearchBar", async () => {
        const user = userEvent.setup();
        openModal();
        render(<QuickCityAddModal />);
      
        await user.click(screen.getByText("SelectCity"));
        expect(useQuickAddStore.getState().isOpen).toBe(false);
    });

    it("closes modal when recent search is selected", async () => {
        const user = userEvent.setup();
        openModal();
        render(<QuickCityAddModal />);
      
        await user.click(screen.getByText("SelectRecent"));
        expect(useQuickAddStore.getState().isOpen).toBe(false);
    });

    it("restores focus to the previously focused trigger when closed", async () => {
        render(
            <>
                <button data-testid="open-button">Open modal</button>
                <QuickCityAddModal />
            </>
        );

        const trigger = screen.getByTestId("open-button");
        trigger.focus();
        expect(trigger).toHaveFocus();

        act(() => {
            useQuickAddStore.getState().setOpen(true);
        });

        expect(await screen.findByRole("dialog")).toBeInTheDocument();

        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: "Close" }));

        await waitFor(() => expect(trigger).toHaveFocus());
    });
      
    it("renders dir='rtl' when locale is Hebrew", () => {
        openModal();
        render(<QuickCityAddModal />, { locale: 'he' });
      
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveAttribute("dir", "rtl");
        expect(screen.getByTestId("popular-cities").textContent).toMatch(/rtl/i);
    });
      
    it("does not render modal content when open=false", () => {
        render(<QuickCityAddModal />);
        expect(screen.queryByTestId("popular-cities")).toBeNull();
        expect(screen.queryByTestId("search-bar")).toBeNull();
        expect(screen.queryByTestId("recent-searches")).toBeNull();
    });
});