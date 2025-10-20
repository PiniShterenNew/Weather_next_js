'use client';

import { Thermometer } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';

export default function Header() {
  const t = useTranslations();
  const { user } = useUser();
  const router = useRouter();

  // Get first letter of name for fallback
  const firstLetter = user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U';

  return (
    <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 bg-white/60 dark:bg-[#0d1117]/60 backdrop-blur-md shadow-sm border-b border-white/10 z-50">
      {/* Left side - Logo with brand name */}
      <div className="flex items-center gap-2">
        <Button
          className="bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-full h-10 w-10 flex items-center justify-center hover-scale shadow-lg hover:shadow-xl transition-all duration-200"
          size="icon"
          aria-label={t('app.title')}
        >
          <Thermometer className="h-5 w-5" />
        </Button>
        <span className="text-lg font-semibold text-gray-900 dark:text-white">WeatherApp</span>
      </div>

      {/* Right side - User profile circle */}
      <button
        onClick={() => router.push('/profile')}
        className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20 p-0 transition-all duration-200 bg-gray-100 dark:bg-white/10 shrink-0"
        aria-label={t('navigation.profile')}
      >
        {user?.imageUrl ? (
          <img
            src={user?.imageUrl}
            alt={user?.fullName || 'User'}
            className="w-10 h-10 object-cover object-center rounded-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-900 dark:text-white font-semibold text-xs">
            {firstLetter}
          </div>
        )}
      </button>
    </header>
  );
}
