'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLayoutEffect, useState, useEffect } from 'react';
import { useWeatherStore } from '@/store/useWeatherStore';
import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { AppLocale } from '@/types/i18n';
import announceAction from '@/lib/actions/announceAction';

export default function LanguageSwitcher() {
  const t = useTranslations('language'); // מפתחות תחת 'language.*'
  const locale = useLocale();
  const localeStore = useWeatherStore((s) => s.locale);
  const setLocale = useWeatherStore((s) => s.setLocale);
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  // Track client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLocaleChange = async (newLocale: 'he' | 'en') => {
    if (newLocale === localeStore) return;
    
    setLocale(newLocale);
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');
    
    // Show toast notification
    announceAction({
      run: async () => {},
      successMessageKey: 'settings.languageChanged',
      values: { language: newLocale === 'he' ? 'עברית' : 'English' }
    });
    
    setIsSwitching(true);
    // Perform navigation, then force hydration tick and refresh for next-intl
    router.replace(newPath);
    await new Promise((r) => setTimeout(r, 0));
    router.refresh();
    setIsSwitching(false);
  };

  useLayoutEffect(() => {
    // Avoid clobbering a locale change in-flight
    if (isClient && !isSwitching) {
      setLocale(locale as AppLocale);
    }
  }, [locale, setLocale, isClient, isSwitching]);

  return (
    <div role="radiogroup" aria-label={t('switchLanguage')}>
			<div className="flex items-center gap-3 bg-gradient-to-br from-white/95 to-white/80 dark:from-gray-800/95 dark:to-gray-900/80 backdrop-blur-xl border-2 border-sky-200/50 dark:border-sky-800/50 rounded-2xl p-1.5">
				<motion.button
					whileTap={{ scale: 0.95 }}
					whileHover={{ scale: 1.05 }}
					onClick={() => handleLocaleChange('he')}
          disabled={isSwitching || (locale as AppLocale) === 'he'}
					role="radio"
          aria-checked={(locale as AppLocale) === 'he'}
					className={`relative h-10 px-5 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
            (locale as AppLocale) === 'he'
							? 'bg-gradient-to-br from-sky-500 to-sky-600 text-white'
							: 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5'
					}`}
				>
          {(locale as AppLocale) === 'he' && (
						<motion.div
							layoutId="language-indicator"
							className="absolute inset-0 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl"
							transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
						/>
					)}
					<span className="relative z-10">{t('he')}</span>
				</motion.button>

				<motion.button
					whileTap={{ scale: 0.95 }}
					whileHover={{ scale: 1.05 }}
					onClick={() => handleLocaleChange('en')}
          disabled={isSwitching || (locale as AppLocale) === 'en'}
					role="radio"
          aria-checked={(locale as AppLocale) === 'en'}
					className={`relative h-10 px-5 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
            (locale as AppLocale) === 'en'
							? 'bg-gradient-to-br from-sky-500 to-sky-600 text-white'
							: 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5'
					}`}
				>
          {(locale as AppLocale) === 'en' && (
						<motion.div
							layoutId="language-indicator"
							className="absolute inset-0 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl"
							transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
						/>
					)}
					<span className="relative z-10">English</span>
				</motion.button>
			</div>
		</div>
	);
}
