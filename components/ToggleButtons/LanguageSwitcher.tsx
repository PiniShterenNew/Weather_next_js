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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
  }, [locale, setLocale]);

  return (
    <Tooltip>
      <Select
        value={localeStore} onValueChange={handleLocaleChange}>
        <TooltipTrigger asChild>
          <SelectTrigger tabIndex={-1} className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
        </TooltipTrigger>
        <SelectContent>
          <SelectItem value="he">{t('he')}</SelectItem>
          <SelectItem value="en">{t('en')}</SelectItem>
        </SelectContent>
      </Select>
      <TooltipContent dir="ltr">{t(localeStore)}</TooltipContent>
    </Tooltip>

  );
}
