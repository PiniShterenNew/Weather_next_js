'use client';

import { Plus, MapPin, Cloud, Settings } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { useWeatherStore } from '@/store/useWeatherStore';
import { hapticButtonPress } from '@/lib/haptics';
 

export default function BottomNavigation() {
  const t = useTranslations();
  const pathname = usePathname();
  const isLoading = useWeatherStore((s) => s.isLoading);
  
  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  // No button-level loading; rely on subtle global indicator instead

  return (
    <>
      {/* Mobile Navigation */}
      <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] lg:hidden animate-slide-up">
        <div className="relative bg-white/80 dark:bg-[#0d1117]/80 rounded-full shadow-lg border border-white/20 backdrop-blur-md">
          {isLoading && (
            <div className="absolute -top-0.5 left-3 right-3 h-0.5">
              <div className="w-full h-full bg-gradient-to-r from-sky-400/70 via-blue-500/70 to-sky-400/70 animate-pulse rounded-full" />
            </div>
          )}
          <div className="flex justify-around items-center h-20 px-2">
            {/* Mobile buttons with original styling */}
            <Link
              href="/add-city"
              prefetch
              className={`flex flex-col items-center justify-center py-3 px-4 rounded-xl min-h-touch-target min-w-touch-target transition-all duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                isActive('/add-city') 
                  ? 'scale-105 bg-sky-500/10 dark:bg-blue-400/10' 
                  : 'hover:scale-105 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 active:bg-gray-200/50 dark:active:bg-gray-700/50'
              }`}
              aria-label={t('search.addCity')}
              onTouchStart={() => hapticButtonPress()}
              onClick={() => hapticButtonPress()}
            >
              <Plus className={`h-7 w-7 mb-1 transition-all duration-150 ${
                isActive('/add-city') ? 'text-sky-500 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'
              }`} />
              <span className={`text-xs font-medium transition-all duration-150 ${
                isActive('/add-city') ? 'text-sky-500 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-200'
              }`}>
                {t('search.addCity')}
              </span>
            </Link>
            <Link
              href="/cities"
              prefetch
              className={`flex flex-col items-center justify-center py-3 px-4 rounded-xl min-h-touch-target min-w-touch-target transition-all duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                isActive('/cities') 
                  ? 'scale-105 bg-sky-500/10 dark:bg-blue-400/10' 
                  : 'hover:scale-105 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 active:bg-gray-200/50 dark:active:bg-gray-700/50'
              }`}
              aria-label={t('navigation.cities')}
              onTouchStart={() => hapticButtonPress()}
              onClick={() => hapticButtonPress()}
            >
              <MapPin className={`h-7 w-7 mb-1 transition-all duration-150 ${
                isActive('/cities') ? 'text-sky-500 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'
              }`} />
              <span className={`text-xs font-medium transition-all duration-150 ${
                isActive('/cities') ? 'text-sky-500 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-200'
              }`}>
                {t('navigation.cities')}
              </span>
            </Link>
            <Link
              href="/"
              prefetch
              className={`flex flex-col items-center justify-center py-3 px-4 rounded-xl min-h-touch-target min-w-touch-target transition-all duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                isActive('/') 
                  ? 'scale-105 bg-sky-500/10 dark:bg-blue-400/10' 
                  : 'hover:scale-105 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 active:bg-gray-200/50 dark:active:bg-gray-700/50'
              }`}
              aria-label={t('navigation.weather')}
              onTouchStart={() => hapticButtonPress()}
              onClick={() => hapticButtonPress()}
            >
              <Cloud className={`h-7 w-7 mb-1 transition-all duration-150 ${
                isActive('/') ? 'text-sky-500 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'
              }`} />
              <span className={`text-xs font-medium transition-all duration-150 ${
                isActive('/') ? 'text-sky-500 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-200'
              }`}>
                {t('navigation.weather')}
              </span>
            </Link>
            <Link
              href="/settings"
              prefetch
              className={`flex flex-col items-center justify-center py-3 px-4 rounded-xl min-h-touch-target min-w-touch-target transition-all duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                isActive('/settings') 
                  ? 'scale-105 bg-sky-500/10 dark:bg-blue-400/10' 
                  : 'hover:scale-105 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 active:bg-gray-200/50 dark:active:bg-gray-700/50'
              }`}
              aria-label={t('navigation.settings')}
              onTouchStart={() => hapticButtonPress()}
              onClick={() => hapticButtonPress()}
            >
              <Settings className={`h-7 w-7 mb-1 transition-all duration-150 ${
                isActive('/settings') ? 'text-sky-500 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'
              }`} />
              <span className={`text-xs font-medium transition-all duration-150 ${
                isActive('/settings') ? 'text-sky-500 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-200'
              }`}>
                {t('navigation.settings')}
              </span>
            </Link>
          </div>
        </div>
      </footer>

      {/* Desktop Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 hidden lg:block animate-slide-up">
        <div className="relative bg-white dark:bg-[#0d1117] shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
          {isLoading && (
            <div className="absolute -top-0.5 left-0 right-0 h-0.5">
              <div className="w-full h-full bg-gradient-to-r from-sky-400/70 via-blue-500/70 to-sky-400/70 animate-pulse rounded-full" />
            </div>
          )}
          <div className="flex justify-center items-center h-[70px] gap-12">
          {/* Add City Button */}
          <Link
            href="/add-city"
            prefetch
            className="flex flex-col items-center justify-center transition-all duration-150 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            aria-label={t('search.addCity')}
            onTouchStart={() => hapticButtonPress()}
            onClick={() => hapticButtonPress()}
          >
            <Plus className={`h-6 w-6 mb-1 transition-all duration-150 ${
              isActive('/add-city') ? 'text-sky-500 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'
            }`} />
            <span className={`text-xs font-medium transition-all duration-150 ${
              isActive('/add-city') ? 'text-sky-500 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'
            }`}>
              {t('search.addCity')}
            </span>
          </Link>
        
          {/* Cities List Button */}
          <Link
            href="/cities"
            prefetch
            className="flex flex-col items-center justify-center transition-all duration-150 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            aria-label={t('navigation.cities')}
            onTouchStart={() => hapticButtonPress()}
            onClick={() => hapticButtonPress()}
          >
            <MapPin className={`h-6 w-6 mb-1 transition-all duration-150 ${
              isActive('/cities') ? 'text-sky-500 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'
            }`} />
            <span className={`text-xs font-medium transition-all duration-150 ${
              isActive('/cities') ? 'text-sky-500 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'
            }`}>
              {t('navigation.cities')}
            </span>
          </Link>
          
          {/* Weather Button */}
          <Link
            href="/"
            prefetch
            className="flex flex-col items-center justify-center transition-all duration-150 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            aria-label={t('navigation.weather')}
            onTouchStart={() => hapticButtonPress()}
            onClick={() => hapticButtonPress()}
          >
            <Cloud className={`h-6 w-6 mb-1 transition-all duration-150 ${
              isActive('/') ? 'text-sky-500 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'
            }`} />
            <span className={`text-xs font-medium transition-all duration-150 ${
              isActive('/') ? 'text-sky-500 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'
            }`}>
              {t('navigation.weather')}
            </span>
          </Link>
          
          {/* Settings Button */}
          <Link
            href="/settings"
            prefetch
            className="flex flex-col items-center justify-center transition-all duration-150 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            aria-label={t('navigation.settings')}
            onTouchStart={() => hapticButtonPress()}
            onClick={() => hapticButtonPress()}
          >
            <Settings className={`h-6 w-6 mb-1 transition-all duration-150 ${
              isActive('/settings') ? 'text-sky-500 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'
            }`} />
            <span className={`text-xs font-medium transition-all duration-150 ${
              isActive('/settings') ? 'text-sky-500 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'
            }`}>
              {t('navigation.settings')}
            </span>
          </Link>
        </div>
      </div>
      </footer>
    </>
  );
}
