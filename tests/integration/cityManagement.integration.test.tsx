import { useWeatherStore } from "@/store/useWeatherStore";
import { cityWeather } from "../fixtures/cityWeather";

const IsraelCity = {
    ...cityWeather,
    name: { en: 'Tel Aviv', he: 'תל אביב' },
    country: { en: 'Israel', he: 'ישראל' },
    lat: 32.0853,
    lon: 34.7818,
    id: 'tel-aviv',
}

const UKCity = {
    ...cityWeather,
    name: { en: 'London', he: 'לונדון' },
    country: { en: 'United Kingdom', he: 'בריטניה' },
    lat: 51.5074,
    lon: 0.1278,
    id: 'london',
}

const FranceCity = {
    ...cityWeather,
    name: { en: 'Paris', he: 'פריז' },
    country: { en: 'France', he: 'צרפת' },
    lat: 48.8566,
    lon: 2.3522,
    id: 'paris',
}

beforeEach(() => {
    const resetStore = useWeatherStore.getState().resetStore;
    resetStore();
})

describe("City Management Integration Flow", () => {
    it("should delete a city", async () => {
        const { addCity, removeCity } = useWeatherStore.getState();
        await addCity(IsraelCity);
        expect(useWeatherStore.getState().cities.length).toBe(1);
        await removeCity(IsraelCity.id);
        expect(useWeatherStore.getState().cities.length).toBe(0);
    })

    it("should navigate between cities", async () => {
        const { addCity, setCurrentIndex } = useWeatherStore.getState();
        await addCity(IsraelCity);
        await addCity(UKCity);
        await addCity(FranceCity);
        expect(useWeatherStore.getState().cities.length).toBe(3);
        setCurrentIndex(1);
        expect(useWeatherStore.getState().currentIndex).toBe(1);
    })

    it("should update a city", async () => {
        const { addCity, updateCity } = useWeatherStore.getState();
        await addCity(IsraelCity);
        expect(useWeatherStore.getState().cities.length).toBe(1);
        updateCity({ ...IsraelCity, name: { en: 'Ashdod', he: 'אשדוד' } });
        expect(useWeatherStore.getState().cities[0].name.en).toBe('Ashdod');
    })

    it("should persist cities between sessions", async () => {
        const { addCity, setCurrentIndex, removeCity, resetStore } = useWeatherStore.getState();
        await addCity(IsraelCity);
        await addCity(UKCity);
        await addCity(FranceCity);
        expect(useWeatherStore.getState().cities.length).toBe(3);
        setCurrentIndex(1);
        expect(useWeatherStore.getState().currentIndex).toBe(1);
        await removeCity(UKCity.id);
        expect(useWeatherStore.getState().cities.length).toBe(2);
        resetStore();
        expect(useWeatherStore.getState().cities.length).toBe(0);
    })
})