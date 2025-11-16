import { useBusyStore } from '@/store/useBusyStore';
import { useWeatherDataStore } from '@/features/weather/store/useWeatherDataStore';
import { useAppPreferencesStore } from '@/store/useAppPreferencesStore';
import { useToastStore } from '@/features/ui/store/useToastStore';
import { fetchWeather } from '@/features/weather/fetchWeather';
import type { TemporaryUnit } from '@/types/ui';
import type { AppLocale } from '@/types/i18n';
import type { CityWeather } from '@/types/weather';

export type AddResult = { status: 'added' | 'exists' | 'max_cities' | 'timeout' | 'error'; cityId?: string; error?: string };

export interface SuggestionInput {
	id: string;
	lat: number;
	lon: number;
	name: { en: string; he: string };
	country?: { en: string; he: string };
	unit?: TemporaryUnit;
}

export interface PopularCityInput {
	id: string;
	lat: number;
	lon: number;
	city: { en: string; he: string };
	country?: { en: string; he: string };
	unit?: TemporaryUnit;
}

export async function addCityFromSuggestion(input: SuggestionInput): Promise<AddResult> {
	const prefs = useAppPreferencesStore.getState();
	const dataStore = useWeatherDataStore.getState();
	const busy = useBusyStore.getState();
	const toast = useToastStore.getState();
	const locale = (prefs.locale as AppLocale) || 'en';

	const key = `city:${input.id}`;
	if (busy.isBusyKey('add', key)) {
		// Join ongoing flow: return generic busy error for now
		return { status: 'error', error: 'operation_in_progress' };
	}

	const token = busy.beginBusy('add', key, { blocking: true, status: { key: 'toasts.adding', values: { city: input.name[locale] } } });
	try {
		// quick duplicate guard
		if (dataStore.cities.some((c) => c.id === input.id)) {
			toast.showToast({ type: 'success', message: 'toasts.exists', values: { city: input.name[locale] } });
			return { status: 'exists', cityId: input.id };
		}

		// fetch weather (timeout handled inside fetchWeather)
		const weather = await fetchWeather({ id: input.id, lat: input.lat, lon: input.lon, unit: (input.unit ?? prefs.unit) as TemporaryUnit, name: input.name, country: input.country });

		// capacity + duplicate re-check
		if (dataStore.cities.length >= dataStore.maxCities) {
			toast.showToast({
				type: 'info',
				message: 'toasts.maxCities',
				values: { maxCities: String(dataStore.maxCities) },
			});
			return { status: 'max_cities' };
		}
		if (dataStore.cities.some((c) => c.id === input.id)) {
			toast.showToast({ type: 'success', message: 'toasts.exists', values: { city: input.name[locale] } });
			return { status: 'exists', cityId: input.id };
		}

		const city: CityWeather = {
			...weather,
			id: input.id,
			lat: input.lat,
			lon: input.lon,
			name: input.name,
			country: input.country ?? weather.country,
			isCurrentLocation: false,
			lastUpdated: Date.now(),
			unit: (input.unit ?? prefs.unit) as TemporaryUnit,
		};

		dataStore.addCity(city);
		toast.showToast({ type: 'success', message: 'toasts.added', values: { city: input.name[locale] } });
		return { status: 'added', cityId: input.id };
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : String(e);
		toast.showToast({ type: 'error', message: 'toasts.error' });
		return { status: 'error', error: message };
	} finally {
		busy.endBusy(token);
	}
}

export async function addCityFromPopular(input: PopularCityInput): Promise<AddResult> {
	return addCityFromSuggestion({
		id: input.id,
		lat: input.lat,
		lon: input.lon,
		name: input.city,
		country: input.country,
		unit: input.unit,
	});
}

export async function addCurrentLocation(): Promise<AddResult> {
	const busy = useBusyStore.getState();
	const toast = useToastStore.getState();

	const key = 'location';
	if (busy.isBusyKey('add', key)) {
		return { status: 'error', error: 'operation_in_progress' };
	}
	const token = busy.beginBusy('add', key, { blocking: true, status: { key: 'toasts.locationAdding' } });
	try {
		// Intentionally a placeholder: caller should provide geolocation; this service performs reverse+weather+store
		throw new Error('not_implemented');
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : String(e);
		toast.showToast({ type: 'error', message: 'toasts.error' });
		return { status: 'error', error: message };
	} finally {
		busy.endBusy(token);
	}
}
