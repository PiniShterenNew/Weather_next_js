'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';
import ThemeSwitcher from '@/components/ToggleButtons/ThemeSwitcher';
import TempUnitToggle from '@/components/ToggleButtons/TempUnitToggle';
import LanguageSwitcher from '@/components/ToggleButtons/LanguageSwitcher';
import { motion } from 'framer-motion';

export default function SettingsModal() {
  const [open, setOpen] = useState(false);
  const t = useTranslations();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.div
          whileHover="hover"
          className="inline-block"
        >
          <Button
            variant="secondary"
            size="icon"
            className='rounded-full'
            aria-label={t('settings.title')}
            title={t('settings.title')}
          >
            <motion.div
              variants={{
                hover: { rotate: 360, scale: 1.1 },
                initial: { rotate: 0, scale: 1 },
              }}
              transition={{ duration: 0.5 }}
            >
              <Settings className="h-5 w-5" />
            </motion.div>
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" dir="auto">
        <DialogHeader>
          <DialogTitle>{t('settings.title')}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t('settings.theme')}</label>
            <ThemeSwitcher />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t('settings.unit')}</label>
            <TempUnitToggle />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t('settings.language')}</label>
            <LanguageSwitcher />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
