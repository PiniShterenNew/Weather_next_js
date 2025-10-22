'use client';

import { Plus, MapPin, Cloud, Settings } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

export default function BottomNavigation() {
  const t = useTranslations();
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] animate-slide-up">
      <div className="bg-white/70 dark:bg-[#0d1117]/70 rounded-full shadow-md border border-white/10 backdrop-blur-md">
        <div className="flex justify-around items-center h-16 px-4">
          {/* Add City Button - Left (RTL: Right) */}
          <Link
            href="/add-city"
            className={`flex flex-col items-center justify-center py-2 px-2 rounded-lg transition-all duration-200 ${
              isActive('/add-city') ? 'scale-105' : 'hover:scale-105'
            }`}
            aria-label={t('search.addCity')}
          >
            <Plus className={`h-6 w-6 mb-1 transition-colors duration-200 ${
              isActive('/add-city') ? 'text-sky-500 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'
            }`} />
            <span className={`text-[11px] transition-colors duration-200 ${
              isActive('/add-city') ? 'text-sky-500 dark:text-blue-400 font-bold' : 'text-gray-600 dark:text-gray-300'
            }`}>
              {t('search.addCity')}
            </span>
          </Link>
        
          {/* Cities List Button - Middle */}
          <Link
            href="/cities"
            className={`flex flex-col items-center justify-center py-2 px-2 rounded-lg transition-all duration-200 ${
              isActive('/cities') ? 'scale-105' : 'hover:scale-105'
            }`}
            aria-label={t('navigation.cities')}
          >
            <MapPin className={`h-6 w-6 mb-1 transition-colors duration-200 ${
              isActive('/cities') ? 'text-sky-500 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'
            }`} />
            <span className={`text-[11px] transition-colors duration-200 ${
              isActive('/cities') ? 'text-sky-500 dark:text-blue-400 font-bold' : 'text-gray-600 dark:text-gray-300'
            }`}>
              {t('navigation.cities')}
            </span>
          </Link>
          
          {/* Weather Button - Right (RTL: Left) */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center py-2 px-2 rounded-lg transition-all duration-200 ${
              isActive('/') ? 'scale-105' : 'hover:scale-105'
            }`}
            aria-label={t('navigation.weather')}
          >
            <Cloud className={`h-6 w-6 mb-1 transition-colors duration-200 ${
              isActive('/') ? 'text-sky-500 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'
            }`} />
            <span className={`text-[11px] transition-colors duration-200 ${
              isActive('/') ? 'text-sky-500 dark:text-blue-400 font-bold' : 'text-gray-600 dark:text-gray-300'
            }`}>
              {t('navigation.weather')}
            </span>
          </Link>
          
          {/* Settings Button */}
          <Link
            href="/settings"
            className={`flex flex-col items-center justify-center py-2 px-2 rounded-lg transition-all duration-200 ${
              isActive('/settings') ? 'scale-105' : 'hover:scale-105'
            }`}
            aria-label={t('navigation.settings')}
          >
            <Settings className={`h-6 w-6 mb-1 transition-colors duration-200 ${
              isActive('/settings') ? 'text-sky-500 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'
            }`} />
            <span className={`text-[11px] transition-colors duration-200 ${
              isActive('/settings') ? 'text-sky-500 dark:text-blue-400 font-bold' : 'text-gray-600 dark:text-gray-300'
            }`}>
              {t('navigation.settings')}
            </span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
