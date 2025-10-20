'use client';

import React from 'react';
import { useEffect } from 'react';
import { useWeatherStore } from '@/store/useWeatherStore';

/**
 * Provider component for theme and text direction
 * @param locale - Current locale code ('en' or 'he')
 * @param children - Child components to render
 */
export function ThemeAndDirectionProvider({ locale, children }: { locale: string, children?: React.ReactNode }) {
  const theme = useWeatherStore((s) => s.theme);

  // Set direction based on locale
  useEffect(() => {
    document.documentElement.dir = locale === 'he' ? 'rtl' : 'ltr';
  }, [locale]);

  // Set theme based on Zustand store
  useEffect(() => {
    const root = document.documentElement;
    const classList = root.classList;
    classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemPrefersDark = globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
      classList.add(systemPrefersDark ? 'dark' : 'light');
    } else {
      classList.add(theme);
    }
  }, [theme]);

  // Always return children, not null
  return <>{children}</>;
}
