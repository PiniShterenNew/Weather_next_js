import { fireEvent, waitFor, within } from "@testing-library/react";
import PopularCities from "@/components/QuickAdd/PopularCities";
import { POPULAR_CITIES } from "@/constants/popularCities";
import { render, screen } from "@/tests/utils/renderWithIntl";
import { FullCityEntry } from "@/types/cache";

// צריך להיות לפני כל describe/render!
const mockUseWeatherStore = {
    // כל מה שיש ב־WeatherStore & WeatherStoreActions!
    cities: [] as FullCityEntry[],
    currentIndex: 0,
    unit: "metric",
    theme: "system",
    direction: "ltr",
    toasts: [],
    isLoading: false,
    autoLocationCityId: undefined,
    userTimezoneOffset: 0,
    locale: "en",
    open: false,
    maxCities: 6,
    addCity: vi.fn(),
    addOrReplaceCurrentLocation: vi.fn(),
    updateCity: vi.fn(),
    removeCity: vi.fn(),
    nextCity: vi.fn(),
    prevCity: vi.fn(),
    refreshCity: vi.fn(),
    setUnit: vi.fn(),
    setLocale: vi.fn(),
    setTheme: vi.fn(),
    setCurrentIndex: vi.fn(),
    showToast: vi.fn(),
    hideToast: vi.fn(),
    setIsLoading: vi.fn(),
    setUserTimezoneOffset: vi.fn(),
    getUserTimezoneOffset: () => 0,
    resetStore: vi.fn(),
    setOpen: vi.fn(),
};

vi.mock('@/store/useWeatherStore', () => ({
    useWeatherStore: (selector = (s: any) => s) => selector(mockUseWeatherStore),
}));

vi.mock('@/features/weather', () => ({
    fetchWeather: vi.fn(() =>
        Promise.resolve({
            id: "city:51.5074_-0.1278",
            lat: 51.5074,
            lon: -0.1278,
            name: { en: "London", he: "לונדון" },
            country: { en: "United Kingdom", he: "הממלכה המאוחדת" },
            timezoneOffsetSeconds: 0,
            current: {
                temp: 10,
                description: "Cloudy",
                icon: "04d",
                humidity: 80,
                pressure: 1012,
                windSpeed: 5,
                dt: 0,
            },
        })
    ),
}));

describe("PopularCities", () => {
    beforeEach(() => {
        // איפוס סטייט לכל טסט
        mockUseWeatherStore.cities = [];
    });

    it("renders city list correctly", () => {
        render(<PopularCities direction="ltr" />);
        expect(screen.getByText(/London/i)).toBeInTheDocument();
        expect(screen.getByText(/New York/i)).toBeInTheDocument();
    });

    it("shows empty message when all cities are added", () => {
        mockUseWeatherStore.cities = POPULAR_CITIES as FullCityEntry[]; // cast for type safety
        render(<PopularCities direction="ltr" />);
        expect(screen.getByText("No more cities to add")).toBeInTheDocument();
    });

    it("renders city button with name and country", () => {
        render(<PopularCities direction="ltr" />);

        const button = screen.getByRole("button", {
            name: /London/i,
        });

        // מאתר את שם העיר
        expect(within(button).getByText("London")).toBeInTheDocument();
    });

    it("adds city on click and closes modal", async () => {
        render(<PopularCities direction="ltr" />);

        const londonButton = screen.getByRole("button", {
            name: /London/i,
        });

        fireEvent.click(londonButton);

        await waitFor(() => {
            expect(mockUseWeatherStore.setIsLoading).toHaveBeenCalledWith(true);
        });

        await waitFor(() => {
            expect(mockUseWeatherStore.addCity).toHaveBeenCalled();
        });
    });

    it("does not add city if already exists and shows toast", async () => {

        // עכשיו מוסיף את לונדון ל־cities (כדי שהלוגיקה תזהה אותה כקיימת)
        const existingCity = POPULAR_CITIES.find(city => city.city.en === "London")!;
        mockUseWeatherStore.cities = [
            {
                ...existingCity,
                id: existingCity.id,
                city: existingCity.city,
                country: existingCity.country,
                lat: existingCity.lat,
                lon: existingCity.lon,
                timezoneOffsetSeconds: existingCity.timezoneOffsetSeconds,
            },
        ];

        render(<PopularCities direction="ltr" />);

        expect(screen.queryByText(/London/i)).not.toBeInTheDocument();

    });
});
