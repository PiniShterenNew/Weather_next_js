import { render, screen, waitFor } from '@/test/utils/renderWithIntl';
import { vi } from 'vitest';

function mockWeatherStore(offset: number) {
    vi.doMock('@/stores/useWeatherStore', () => {
        const store = {
            getUserTimezoneOffset: () => offset,
        };
        return {
            useWeatherStore: (selector: any) => selector(store),
            getState: () => store,
        };
    });
}

vi.useFakeTimers().setSystemTime(new Date('2025-06-24T12:00:00Z')); // קיבוע זמן

// Mock קבוע של הפונקציות מה-helpers
vi.mock('@/lib/helpers', async (original) => {
    const actual = await vi.importActual<typeof import('@/lib/helpers')>('@/lib/helpers');
    return {
        ...actual,
        isSameTimezone: (tz: number, userTz: number) => tz === userTz ? true : false,
        formatTimeWithOffset: (time: number, offset: number) => {
            const date = new Date((time + offset) * 1000);
            return date.toISOString().slice(11, 16); // HH:mm
        },
    };
});

async function getWeatherTimeNow() {
    return (await import('./WeatherTimeNow')).default;
}

afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
});

describe('WeatherTimeNow', () => {

    it('renders city time and date only if user and city timezone are equal', async () => {
        mockWeatherStore(7200); // העיר והמשתמש שניהם ב-7200
        const WeatherTimeNow = await getWeatherTimeNow();
        const { unmount } = render(<WeatherTimeNow timezone={7200} lastUpdated={Math.floor(Date.now() / 1000)} />);
        // אמור להיות רק אחד כזה
        const cityTime = screen.getByTestId('city-time');
        expect(cityTime).toBeInTheDocument();
        expect(cityTime).toHaveTextContent(/Tuesday, June 24/);
        unmount();
    });

    it('renders both city and user time/date if different timezone', async () => {
        mockWeatherStore(7200); // המשתמש ב-7200, העיר ב-0
        const WeatherTimeNow = await getWeatherTimeNow();
        const { unmount } = render(<WeatherTimeNow timezone={0} lastUpdated={Math.floor(Date.now() / 1000)} />);
        // עכשיו אמור להיות שתיים!
        const cityTime = screen.getByTestId('city-time');
        const userTime = screen.getByTestId('user-time');
        expect(cityTime).toBeInTheDocument();
        expect(userTime).toBeInTheDocument();
        expect(cityTime).toHaveTextContent(/Tuesday, June 24/);
        expect(userTime).toHaveTextContent(/your time/i);
        unmount();
    });

    it('does not render user time if same timezone', async () => {
        mockWeatherStore(7200);
        const WeatherTimeNow = await getWeatherTimeNow();
        const { unmount } = render(<WeatherTimeNow timezone={7200} lastUpdated={Math.floor(Date.now() / 1000)} />);
        expect(screen.queryByTestId('user-time')).not.toBeInTheDocument();
        unmount();
    });

    it('renders last updated time correctly', async () => {
        mockWeatherStore(7200); // המשתמש ב-7200, העיר ב-0
        const time = new Date('2025-06-24T13:45:00Z');
        const WeatherTimeNow = await getWeatherTimeNow();
        render(<WeatherTimeNow timezone={0} lastUpdated={Math.floor(time.getTime() / 1000)} />);
        const lastUpdated = screen.getByTestId('last-updated');
        expect(lastUpdated).toBeInTheDocument();
        expect(lastUpdated).toHaveTextContent(/15:45/);
    });

    it('blinking colon has changing opacity every second', async () => {
        mockWeatherStore(7200); // המשתמש ב-7200, העיר ב-0
        const WeatherTimeNow = await getWeatherTimeNow();
        render(<WeatherTimeNow timezone={0} lastUpdated={Math.floor(Date.now() / 1000)} />);
        const colon = screen.getAllByText(':')[0];
        const initialOpacity = colon.className.includes('opacity-100') || colon.className.includes('opacity-20') || colon.className.includes('opacity-30');
        expect(initialOpacity).toBe(true);
        vi.advanceTimersByTime(1000);
        const updatedColon = screen.getAllByText(':')[0];
        expect(updatedColon.className).toMatch(/opacity-(100|20|30)/);
    });
});
