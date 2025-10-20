'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLayoutEffect, useTransition } from 'react';
import { useWeatherStore } from '@/store/useWeatherStore';
import { useLocale, useTranslations } from 'next-intl';
import { AppLocale } from '@/types/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

export default function AuthLanguageSwitcher() {
  const t = useTranslations('language'); // מפתחות תחת 'language.*'
  const locale = useLocale();
  const localeStore = useWeatherStore((s) => s.locale);
  const setLocale = useWeatherStore((s) => s.setLocale);
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: 'he' | 'en') => {
    if (newLocale === localeStore) return;
    
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
    <div className="m-4">
      <Select value={localeStore} onValueChange={handleLocaleChange}>
        <SelectTrigger className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-full h-10 w-10 flex items-center justify-center text-sm font-medium shadow-lg hover-scale transition-all duration-200 [&>svg:last-child]:hidden [&>span]:hidden">
          <Globe className="h-4 w-4 text-gray-800 dark:text-white" />
        </SelectTrigger>
        <SelectContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-[0_10px_40px_rgb(0,0,0,0.15)] dark:shadow-[0_10px_40px_rgb(0,0,0,0.4)] animate-slide-up">
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
