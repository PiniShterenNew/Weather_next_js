'use client';

import { Thermometer } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/ui/UserAvatar';

export default function Header() {
  const t = useTranslations();
  const router = useRouter();

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
      <UserAvatar
        onClick={() => router.push('/profile')}
        size="md"
        className="hover:scale-105 transition-transform duration-200"
      />
    </header>
  );
}
