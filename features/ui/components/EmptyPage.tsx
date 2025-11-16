// components/WeatherCard/WeatherEmpty.tsx
'use client';

import { useTranslations } from 'next-intl';
import { Cloud } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import CitiesSuggestions from '@/features/search/components/CitiesSuggestions';

const AddLocation = dynamic(() => import('@/features/search/components/quickAdd/AddLocation').then((module) => module.default), {
  loading: () => (
    <Skeleton className="h-10 w-full" />
  ),
});

export default function EmptyPage() {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-6 w-full" data-testid="weather-empty">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex-1 flex flex-col items-center justify-center gap-8 w-full max-w-3xl mx-auto"
      >
        {/* Main Empty State */}
        <Card className="w-full">
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="mb-6"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-brand-100 dark:bg-brand-900/20 flex items-center justify-center">
                <Cloud className="h-10 w-10 text-brand-500" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="space-y-4"
            >
              <h1 className="text-2xl font-bold text-foreground">{t('empty')}</h1>
              <p className="text-muted-foreground leading-relaxed">{t('emptyDescription')}</p>
              
              <div className="mt-6">
                <AddLocation type="default" size="lg" dataTestId="add-location" />
              </div>
            </motion.div>
          </CardContent>
        </Card>

        {/* Popular Cities Section (shared) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="w-full"
        >
          <CitiesSuggestions />
        </motion.div>
      </motion.div>
    </div>
  );
}