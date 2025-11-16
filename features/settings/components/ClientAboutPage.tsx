'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import AboutCard from '@/features/settings/components/AboutCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ClientAboutPage() {
  const router = useRouter();
  const t = useTranslations();

  return (
    <div className="h-screen bg-gradient-to-b from-blue-50 to-white dark:from-[#0d1117] dark:to-[#1b1f24] flex flex-col">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between p-4 pt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="gap-2 rtl:flex-row-reverse bg-white/60 dark:bg-white/5 backdrop-blur-md border-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('navigation.back')}
        </Button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('about.title')}
        </h1>
        <div className="w-20"></div> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 pb-6">
        <div className="w-full max-w-md mx-auto">
          <AboutCard />
        </div>
      </div>
    </div>
  );
}

