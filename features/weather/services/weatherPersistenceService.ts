'use client';

import { z } from 'zod';

import type { CityWeather } from '@/types/weather';
import type { TemporaryUnit } from '@/types/ui';
import type { AppLocale } from '@/types/i18n';
import { fetchSecure } from '@/lib/fetchSecure';

const CityNameSchema = z.object({
  en: z.string(),
  he: z.string(),
});

const CitySnapshotSchema = z.object({
  id: z.string(),
  lat: z.number(),
  lon: z.number(),
  name: CityNameSchema,
  country: CityNameSchema,
  isCurrentLocation: z.boolean().optional(),
  lastUpdated: z.number().optional(),
  current: z.unknown(),
  forecast: z.unknown(),
  hourly: z.unknown(),
  unit: z.enum(['metric', 'imperial']).optional(),
});

const UserPreferencesPayloadSchema = z.object({
  locale: z.enum(['he', 'en']) satisfies z.ZodType<AppLocale>,
  theme: z.enum(['system', 'light', 'dark']),
  unit: z.enum(['metric', 'imperial']) satisfies z.ZodType<TemporaryUnit>,
  cities: z.array(CitySnapshotSchema),
});

export type UserPreferencesPayload = z.infer<typeof UserPreferencesPayloadSchema>;

const persistUserPreferences = async (payload: UserPreferencesPayload): Promise<void> => {
  const validatedPayload = UserPreferencesPayloadSchema.parse(payload);

  const response = await fetchSecure('/api/user/preferences', {
    method: 'POST',
    body: JSON.stringify(validatedPayload),
    requireAuth: true,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to persist user preferences: ${response.status} ${errorText}`);
  }
};

const normalizeCityForPersistence = (city: CityWeather): z.infer<typeof CitySnapshotSchema> => ({
  id: city.id,
  lat: city.lat,
  lon: city.lon,
  name: city.name,
  country: city.country,
  isCurrentLocation: Boolean(city.isCurrentLocation),
  lastUpdated: city.lastUpdated,
  current: city.current,
  forecast: city.forecast,
  hourly: city.hourly,
  unit: city.unit,
});

export const weatherPersistenceService = {
  persistUserPreferences,
  normalizeCityForPersistence,
};


