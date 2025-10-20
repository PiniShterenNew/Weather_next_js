'use client';

import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { useWeatherStore } from '@/store/useWeatherStore';
import { motion } from 'framer-motion';

export function QuickAddButton() {
  const t = useTranslations();
  const { setOpen } = useWeatherStore();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Button
        variant="primary"
        size="lg"
        onClick={() => setOpen(true)}
        className="rounded-full px-6 gap-2 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/90 hover:scale-105"
      >
        <Plus className="h-5 w-5" />
        <span className="font-medium">{t('search.addCity')}</span>
      </Button>
    </motion.div>
  );
}
