'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLayoutEffect, useTransition, useState, useEffect } from 'react';
import { useWeatherStore } from '@/store/useWeatherStore';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { useLocale, useTranslations } from 'next-intl';
import { AppLocale } from '@/types/i18n';

export default function LanguageSwitcher() {
  const t = useTranslations('language'); // מפתחות תחת 'language.*'
  const locale = useLocale();
  const localeStore = useWeatherStore((s) => s.locale);
  const setLocale = useWeatherStore((s) => s.setLocale);
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [isClient, setIsClient] = useState(false);

  // Track client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLocaleChange = (newLocale: 'he' | 'en') => {
    if (newLocale === localeStore) return;
    
    setLocale(newLocale);
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');
    
    // Show toast notification
    useWeatherStore.getState().showToast({
      message: 'settings.languageChanged',
      type: 'success',
      values: { language: newLocale === 'he' ? 'עברית' : 'English' }
    });
    
    startTransition(() => router.replace(newPath));
  };

  useLayoutEffect(() => {
    if (isClient) {
      setLocale(locale as AppLocale);
    }
  }, [locale, setLocale, isClient]);

  return (
    <div className="relative">
      <Select value={isClient ? localeStore : locale} onValueChange={handleLocaleChange}>
        <SelectTrigger className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl h-10 px-4 w-auto min-w-[90px] flex items-center justify-center text-sm font-medium hover-scale transition-all duration-200">
          <SelectValue>
            {isClient ? (localeStore === 'he' ? t('he') : t('en')) : (locale === 'he' ? t('he') : t('en'))}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl animate-slide-up">
          <SelectItem value="he" className="cursor-pointer hover:bg-brand-50 dark:hover:bg-brand-950/30 rounded-xl transition-all">
            {t('he')}
          </SelectItem>
          <SelectItem value="en" className="cursor-pointer hover:bg-brand-50 dark:hover:bg-brand-950/30 rounded-xl transition-all">
            {t('en')}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
