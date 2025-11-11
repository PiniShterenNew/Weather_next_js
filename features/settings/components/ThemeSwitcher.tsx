'use client';

import { useWeatherStore } from '@/store/useWeatherStore';
import { useTranslations } from 'next-intl';
import { Sun, Moon, Laptop } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function ThemeSwitcher() {
  const t = useTranslations('theme'); // מפתחות תחת 'theme.*'

  const theme = useWeatherStore((s) => s.theme);
  const setTheme = useWeatherStore((s) => s.setTheme);

  const cycleTheme = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(next);
    
    // Show toast notification
    useWeatherStore.getState().showToast({
      message: 'settings.themeChanged',
      type: 'success',
      values: { theme: next === 'light' ? t('light') : next === 'dark' ? t('dark') : t('system') }
    });
  };

  const icon =
    theme === 'light' ? (
      <Sun size={18} role="presentation" />
    ) : theme === 'dark' ? (
      <Moon size={18} role="presentation" />
    ) : (
      <Laptop size={18} role="presentation" />
    );

  const label = theme === 'light' ? t('light') : theme === 'dark' ? t('dark') : t('system');

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }}>
          <Button
            tabIndex={-1}
            variant="outline" 
            size="icon" 
            onClick={cycleTheme} 
            aria-label={label}
            className="h-10 w-10 rounded-xl border-2 border-sky-200 dark:border-sky-800 bg-white/90 dark:bg-gray-800/90 hover:bg-sky-50 dark:hover:bg-sky-950/50 transition-colors"
          >
            {icon}
          </Button>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent className="rounded-xl">{label}</TooltipContent>
    </Tooltip>
  );
}
