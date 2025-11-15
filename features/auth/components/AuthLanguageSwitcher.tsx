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
    <div>
      <Select value={localeStore} onValueChange={handleLocaleChange}>
        <SelectTrigger 
          className="w-10 h-10 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-lg flex items-center justify-center text-sm font-medium shadow-lg hover:bg-white/20 active:bg-white/30 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 [&>svg:last-child]:hidden [&>span]:hidden"
          aria-label={t('switchLanguage')}
        >
          <Globe className="w-5 h-5 text-white dark:text-gray-800" aria-hidden="true" />
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
