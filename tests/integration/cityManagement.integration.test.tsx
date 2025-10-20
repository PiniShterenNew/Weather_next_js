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
    it("should delete a city", () => {
        useWeatherStore.getState().addCity(IsraelCity);
        expect(useWeatherStore.getState().cities.length).toBe(1);
        const removeCity = useWeatherStore.getState().removeCity;
        removeCity(IsraelCity.id);
        expect(useWeatherStore.getState().cities.length).toBe(0);
    })
    it("should navigate between cities", () => {
        useWeatherStore.getState().addCity(IsraelCity);
        useWeatherStore.getState().addCity(UKCity);
        useWeatherStore.getState().addCity(FranceCity);
        expect(useWeatherStore.getState().cities.length).toBe(3);
        const navigateToCity = useWeatherStore.getState().setCurrentIndex;
        navigateToCity(1);
        expect(useWeatherStore.getState().currentIndex).toBe(1);
    })
    it("should update a city", () => {
        useWeatherStore.getState().addCity(IsraelCity);
        expect(useWeatherStore.getState().cities.length).toBe(1);
        const updateCity = useWeatherStore.getState().updateCity;
        updateCity({...IsraelCity, name: { en: 'Ashdod', he: 'אשדוד' } });
        expect(useWeatherStore.getState().cities[0].name.en).toBe('Ashdod');
    })
    it("should persist cities between sessions", () => {
        useWeatherStore.getState().addCity(IsraelCity);
        useWeatherStore.getState().addCity(UKCity);
        useWeatherStore.getState().addCity(FranceCity);
        expect(useWeatherStore.getState().cities.length).toBe(3);
        const navigateToCity = useWeatherStore.getState().setCurrentIndex;
        navigateToCity(1);
        expect(useWeatherStore.getState().currentIndex).toBe(1);
        const removeCity = useWeatherStore.getState().removeCity;
        removeCity(UKCity.id);
        expect(useWeatherStore.getState().cities.length).toBe(2);
        const resetStore = useWeatherStore.getState().resetStore;
        resetStore();
        expect(useWeatherStore.getState().cities.length).toBe(0);
    })
})