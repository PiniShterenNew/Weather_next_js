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
      <Sun size={16} role="presentation" className="text-white dark:text-gray-800" />
    ) : theme === 'dark' ? (
      <Moon size={16} role="presentation" className="text-white dark:text-gray-800" />
    ) : (
      <Laptop size={16} role="presentation" className="text-white dark:text-gray-800" />
    );

  const ariaLabel = theme === 'light' ? t('light') : theme === 'dark' ? t('dark') : t('system');
  
  return (
    <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }}>
      <Button
        variant="outline" 
        size="icon" 
        onClick={cycleTheme} 
        aria-label={ariaLabel || 'Toggle theme'}
        className="w-10 h-10 rounded-lg border-2 border-white/20 bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
      >
        {icon}
      </Button>
    </motion.div>
  );
}
