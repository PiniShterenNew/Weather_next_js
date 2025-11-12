'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

// Lazy load settings components - only load when modal opens
const ThemeSwitcher = dynamic(() => import('./ThemeSwitcher'), {
  loading: () => <div className="h-10 w-32 animate-pulse bg-gray-200 dark:bg-gray-700 rounded" />,
});

const TemperatureUnitToggle = dynamic(() => import('./TemperatureUnitToggle'), {
  loading: () => <div className="h-10 w-32 animate-pulse bg-gray-200 dark:bg-gray-700 rounded" />,
});

const LanguageSwitcher = dynamic(() => import('./LanguageSwitcher'), {
  loading: () => <div className="h-10 w-24 animate-pulse bg-gray-200 dark:bg-gray-700 rounded" />,
});

export default function SettingsModal() {
  const [open, setOpen] = useState(false);
  const t = useTranslations();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="text-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          aria-label={t('settings.title')}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Settings size={20} />
          </motion.div>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-gray-200/50 dark:border-gray-700/50 rounded-3xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{t('settings.title')}</DialogTitle>
          <DialogDescription>{t('settings.description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('settings.language')}
            </h3>
            <LanguageSwitcher />
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('settings.temperature')}
            </h3>
            <TemperatureUnitToggle />
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('settings.theme')}
            </h3>
            <ThemeSwitcher />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
