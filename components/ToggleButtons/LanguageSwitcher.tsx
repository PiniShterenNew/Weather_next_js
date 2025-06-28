'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLayoutEffect, useTransition } from 'react';
import { useWeatherStore } from '@/stores/useWeatherStore';
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

  const handleLocaleChange = (newLocale: 'he' | 'en') => {
    setLocale(newLocale);
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');
    startTransition(() => router.replace(newPath));
  };

 useLayoutEffect(() => {
    setLocale(locale as AppLocale);
  }, [locale]);

  return (
    <Select value={localeStore} onValueChange={handleLocaleChange}>
      <SelectTrigger className="w-[100px]" aria-label={t(localeStore)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="he" aria-label={t('he')}>{t('he')}</SelectItem>
        <SelectItem value="en" aria-label={t('en')}>{t('en')}</SelectItem>
      </SelectContent>
    </Select>
  );
}
