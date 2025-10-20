import { useWeatherStore } from "@/store/useWeatherStore";
import { Button, ButtonProperties } from "../ui/button";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { TemporaryUnit } from "@/types/ui";
import { fetchReverse } from "@/features/weather/fetchReverse";
import { fetchWeather } from "@/features/weather";
import { motion } from "framer-motion";
import { WeatherIcon } from "../WeatherIcon/WeatherIcon";
import { getDirection } from "@/lib/intl";
import { AppLocale } from "@/types/i18n";

type Properties = {
    size: ButtonProperties['size'];
    type: 'icon' | 'default';
    dataTestid?: string;
}

export default function AddLocation({ size, type, dataTestid }: Properties) {
    const { cities, setIsLoading, showToast, addOrReplaceCurrentLocation, unit, locale } = useWeatherStore();
    const router = useRouter();
    const pathname = usePathname();
    const t = useTranslations();
    const { setOpen } = useWeatherStore();
    const currentLocale = useLocale() as AppLocale;
    const direction = getDirection(currentLocale);
    const isAddCityPage = pathname === '/add-city';

    function getCurrentPositionAsync(): Promise<GeolocationPosition> {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: false, // Faster, less accurate
                maximumAge: 60000, // Use cached position if less than 1 minute old
                timeout: 5000, // Reduced from 10 seconds to 5 seconds
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

            // Navigate to home page if on add-city page
            if (isAddCityPage) {
                router.push('/');
            }

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
            disabled={cities.some(city => city.isCurrentLocation === true)}
            className="shadow-sm rounded-full hover:bg-primary/10 transition-colors"
            dir={direction}
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