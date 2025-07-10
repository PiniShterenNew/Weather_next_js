import { useWeatherStore } from "@/stores/useWeatherStore";
import { Button, ButtonProperties } from "../ui/button";
import { useTranslations } from "next-intl";
import { TemporaryUnit } from "@/types/ui";
import { fetchReverse } from "@/features/weather/fetchReverse";
import { fetchWeather } from "@/features/weather";
import { motion } from "framer-motion";
import { WeatherIcon } from "../WeatherIcon/WeatherIcon";

type Properties = {
    size: ButtonProperties['size'];
    type: 'icon' | 'default';
    dataTestid?: string;
}

export default function AddLocation({ size, type, dataTestid }: Properties) {
    const { autoLocationCityId, setIsLoading, showToast, addOrReplaceCurrentLocation, unit, locale } = useWeatherStore();
    const t = useTranslations();
    const { setOpen } = useWeatherStore();

    function getCurrentPositionAsync(): Promise<GeolocationPosition> {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: false,
                timeout: 10_000,
            });
        });
    }

    const handleAddCurrentLocation = async () => {
        if (typeof window === 'undefined') return;

        if (!('geolocation' in navigator) || !navigator.geolocation) {
            showToast({ message: 'errors.geolocationNotSupported', type: 'error' });
            return;
        }

        setIsLoading(true);
        setOpen(false);

        try {
            const { coords } = await getCurrentPositionAsync();

            const cityInfo = await fetchReverse(coords.latitude, coords.longitude, locale);
            const weatherData = await fetchWeather({
                lat: cityInfo.lat,
                lon: cityInfo.lon,
                unit: unit as TemporaryUnit,
                id: cityInfo.id,
            });

            const completeWeatherData = {
                ...weatherData,
                name: {
                    en: weatherData.name.en,
                    he: weatherData.name.he
                },
                country: {
                    en: weatherData.country.en,
                    he: weatherData.country.he
                },
                id: cityInfo.id,
                lastUpdated: Date.now(),
                isCurrentLocation: true
            };

            addOrReplaceCurrentLocation(completeWeatherData);

            showToast({
                message: 'toasts.locationAdded',
                type: 'success',
                values: { name: completeWeatherData.name[locale] },
            });

        } catch {
            showToast({ message: 'errors.fetchLocationWeather', type: 'error' });
        } finally {
            setIsLoading(false); // עכשיו זה יקרה באמת בסוף הכל
        }
    };

    return (
        <Button
            variant="outline"
            size={size}
            onClick={handleAddCurrentLocation}
            title={t('search.currentLocation')}
            data-testid={dataTestid}
            aria-label={t('search.currentLocation')}
            disabled={autoLocationCityId !== undefined}
            className="shadow-sm rounded-full hover:bg-primary/10 transition-colors"
            asChild
        >
            <motion.button
                whileHover="hover"
            >
                <motion.span
                    variants={{ hover: { scale: 1.2 } }}
                    transition={{ duration: 0.2 }}
                    data-testid="location-icon"
                    role="presentation"
                    className="inline-flex"
                >
                    <WeatherIcon icon="location" size={24} />
                </motion.span>
                {type !== 'icon' && t('search.addCurrentLocation')}
            </motion.button>
        </Button>
    );
}