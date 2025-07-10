// components/WeatherCard/WeatherEmpty.tsx
'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { AppLocale } from '@/types/i18n';
import { Star } from 'lucide-react';
import PopularCities from '../QuickAdd/PopularCities';
import { getDirection } from '@/lib/intl';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Skeleton } from '../ui/skeleton';

const AddLocation = dynamic(() => import('@/components/QuickAdd/AddLocation').then((module) => module.default), {
  loading: () => (
    <Skeleton className="h-10 w-full" />
  ),
});

export default function EmptyPage() {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const direction = getDirection(locale);

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 w-full max-w-full mx-auto" data-testid="weather-empty">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex flex-col items-center justify-center gap-6"
      >
        <div className="text-center space-y-3">
          <h1 className="text-6xl font-semibold text-primary/90">{t('empty')}</h1>
          <p className="text-4xl text-muted-foreground">{t('emptyDescription')}</p>
        </div>

        <div className="mt-2">
          <AddLocation type="default" size="lg" dataTestid="add-location-text" />
        </div>
      </motion.div>
      <div className="w-full mt-4">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="flex-1"
        >
          <h2 className="text-lg font-semibold mb-3 text-center flex items-center justify-center gap-2">
            <Star className="h-4 w-4 text-primary" />
            {t('popular.title')}
          </h2>
          <PopularCities direction={direction} color={"primary"} />
        </motion.div>
      </div>
    </div>
  );
}