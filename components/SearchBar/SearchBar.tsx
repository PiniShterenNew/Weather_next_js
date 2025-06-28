'use client';

import { useEffect, useState } from 'react';
import { fetchSuggestions, fetchWeather } from '@/features/weather';
import { useWeatherStore } from '@/stores/useWeatherStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button'; // Added
import { LocateFixed } from 'lucide-react'; // Added
import { useLocale, useTranslations } from 'next-intl';
import type { CitySuggestion } from '@/types/suggestion';
import { useDebounce } from '@/lib/useDebounce';
import { AppLocale } from '@/types/i18n';
import { TemporaryUnit } from '@/types/ui';
import { fetchReverse } from '@/features/weather/fetchReverse';

export default function SearchBar() {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);

  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const addCity = useWeatherStore((s) => s.addCity);
  const addOrReplaceCurrentLocation = useWeatherStore((s) => s.addOrReplaceCurrentLocation); 
  const autoLocationCityId = useWeatherStore((s) => s.autoLocationCityId); 
  const showToast = useWeatherStore((s) => s.showToast);
  const cities = useWeatherStore((s) => s.cities);
  const unit = useWeatherStore((s) => s.unit);
  const setIsLoading = useWeatherStore((s) => s.setIsLoading);

  // בקשת הצעות
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 3) {
      setSuggestions([]);
      return;
    }
    fetchSuggestions(debouncedQuery)
      .then(setSuggestions)
      .catch(() => setSuggestions([]));
  }, [debouncedQuery]);

  const handleAddCurrentLocation = async () => {
    if (!('geolocation' in navigator)) {
      showToast({ message: 'errors.geolocationNotSupported' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const cityInfo = await fetchReverse(coords.latitude, coords.longitude, locale);
          const weatherData = await fetchWeather({
            lat: coords.latitude,
            lon: coords.longitude,
            name: cityInfo.name,
            country: cityInfo.country,
            unit: unit as TemporaryUnit,
            lang: locale,
            id: '',
          });

          // ניצור ID ייחודי למיקום הנוכחי
          const currentLocationId = `current_${coords.latitude.toFixed(2)}_${coords.longitude.toFixed(2)}`;

          // נוסיף את ה-ID לנתוני מזג האוויר
          addOrReplaceCurrentLocation({
            ...weatherData,
            id: currentLocationId,
            isCurrentLocation: true
          });

          setQuery('');
          setSuggestions([]);
          showToast({ message: 'toasts.locationAdded', values: { name: weatherData.name } });
        } catch {
          showToast({ message: 'errors.fetchLocationWeather' });
        }
      },
      () => {
        showToast({ message: 'errors.geolocationDenied' });
      },
      { enableHighAccuracy: false, timeout: 10_000 },
    );
  };

  const handleSelect = async (city: CitySuggestion) => {
    setIsLoading(true); // התחלת טעינה

    try {
      const exists = cities.some((c) => c.id === city.id);
      if (exists) {
        showToast({ message: 'toasts.exists' });
        return;
      }

      const weather = await fetchWeather({
        lat: city.lat,
        lon: city.lon,
        name: city.name,
        country: city.country,
        unit: unit as TemporaryUnit,
        lang: locale,
        id: city.id,
      });
      addCity(weather);
      setQuery('');
      setSuggestions([]);
    } catch {
      showToast({ message: 'errors.fetchWeather' });
    } finally {
      setIsLoading(false); // סיום טעינה
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('search.placeholder')}
          aria-label={t('search.placeholder')}
          className="flex-grow"
        />
        {!autoLocationCityId && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleAddCurrentLocation}
            title={t('search.currentLocation')}
            aria-label={t('search.currentLocation')}
          >
            <LocateFixed className="h-5 w-5" />
          </Button>
        )}
      </div>

      {suggestions.length > 0 && (
        <ul className="absolute z-50 mt-2 w-full rounded border bg-white shadow dark:bg-zinc-900">
          {suggestions.map((s) => (
            <li
              key={s.id}
              className="cursor-pointer px-3 py-2 hover:bg-muted transition"
              onClick={() => handleSelect(s)}
            >
              {s.displayName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
