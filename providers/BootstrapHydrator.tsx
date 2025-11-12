'use client';

import { useEffect } from 'react';
import { useWeatherStore } from '@/store/useWeatherStore';
import type { BootstrapData } from '@/lib/server/bootstrap';

type BootstrapHydratorProps = {
  data: BootstrapData | null;
};

export default function BootstrapHydrator({ data }: BootstrapHydratorProps) {
  useEffect(() => {
    if (!data) return;
    // We trust server shape from loadBootstrapData; pass-through to store
    const { cities, currentCityId, user } = data;
    useWeatherStore.getState().loadFromServer({
      cities,
      currentCityId: currentCityId ?? undefined,
      user,
    });
  }, [data]);

  return null;
}


