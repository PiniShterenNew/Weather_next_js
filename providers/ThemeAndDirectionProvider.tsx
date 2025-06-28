'use client';

import React from 'react';
import { useEffect } from 'react';
import { useWeatherStore } from '@/stores/useWeatherStore';

// צריך לקבל locale כ־prop
export function ThemeAndDirectionProvider({ locale, children }: { locale: string, children?: React.ReactNode }) {
  const theme = useWeatherStore((s) => s.theme);

  // Direction (dir) לפי locale
  useEffect(() => {
    document.documentElement.dir = locale === 'he' ? 'rtl' : 'ltr';
  }, [locale]);

  // Theme לפי Zustand
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

  // אל תחזיר null! תחזיר children.
  return <>{children}</>;
}
