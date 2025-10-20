'use client';

import { useWeatherStore } from '@/store/useWeatherStore';
import { useTranslations } from 'next-intl';
import { Sun, Moon, Laptop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function AuthThemeSwitcher() {
  const t = useTranslations('theme');
  const theme = useWeatherStore((s) => s.theme);
  const setTheme = useWeatherStore((s) => s.setTheme);

  const cycleTheme = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(next);
  };

  const icon =
    theme === 'light' ? (
      <Sun size={16} role="presentation" className="text-gray-800 dark:text-white" />
    ) : theme === 'dark' ? (
      <Moon size={16} role="presentation" className="text-gray-800 dark:text-white" />
    ) : (
      <Laptop size={16} role="presentation" className="text-gray-800 dark:text-white" />
    );

  return (
    <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }}>
      <Button
        variant="outline" 
        size="icon" 
        onClick={cycleTheme} 
        aria-label={theme === 'light' ? t('light') : theme === 'dark' ? t('dark') : t('system')}
        className="h-10 w-10 m-4 rounded-full border-2 border-white/20 bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-xl"
      >
        {icon}
      </Button>
    </motion.div>
  );
}
