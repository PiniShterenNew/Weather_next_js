'use client';

import { useWeatherStore } from '@/stores/useWeatherStore';
import { useTranslations } from 'next-intl';
import { Sun, Moon, Laptop } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

export default function ThemeSwitcher() {
  const t = useTranslations('theme'); // מפתחות תחת 'theme.*'

  const theme = useWeatherStore((s) => s.theme);
  const setTheme = useWeatherStore((s) => s.setTheme);

  const cycleTheme = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(next);
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
        <Button
          tabIndex={-1}
          variant="outline" size="icon" onClick={cycleTheme} aria-label={label}>
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
