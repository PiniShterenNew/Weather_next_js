'use client';

import { useEffect } from 'react';
import { useWeatherStore } from '@/store/useWeatherStore';

type BootstrapHydratorProps = {
  data: unknown | null;
};

export default function BootstrapHydrator({ data }: BootstrapHydratorProps) {
  useEffect(() => {
    if (!data) return;
    // We trust server shape from loadBootstrapData; pass-through to store
    useWeatherStore.getState().loadFromServer(data as { cities: unknown[]; currentCityId?: string; user: { locale: string; unit: string } });
  }, [data]);

  return null;
}


