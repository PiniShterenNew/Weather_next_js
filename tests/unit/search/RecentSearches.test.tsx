import { render, screen } from "@/tests/utils/renderWithIntl";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

const mockRecentSearches = [
  { name: "Tel Aviv", country: "IL", temp: "28°" },
  { name: "Paris", country: "FR", temp: "19°" },
];

vi.mock("@/store/useRecentSearchesStore", () => ({
  useRecentSearchesStore: () => ({
    searches: mockRecentSearches,
  }),
}));

import { RecentSearches } from "@/features/search/components/RecentSearches";

describe("RecentSearches", () => {
  it("announces updates and lists items accessibly", () => {
    const onSelect = vi.fn();
    render(<RecentSearches onSelect={onSelect} />);

    const list = screen.getByRole("list");
    expect(list).toHaveAttribute("aria-live", "polite");
    expect(screen.getAllByRole("button")).toHaveLength(mockRecentSearches.length);
  });

  it("supports keyboard selection", async () => {
    const onSelect = vi.fn();
    render(<RecentSearches onSelect={onSelect} />);

    const user = userEvent.setup();

    await user.tab();
    await user.keyboard("{Enter}");

    expect(onSelect).toHaveBeenCalledWith(mockRecentSearches[0]);
  });
});

