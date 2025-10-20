'use client';

import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { useWeatherStore } from '@/store/useWeatherStore';

export function QuickAddTrigger() {
  const t = useTranslations();
  const { setOpen } = useWeatherStore();

  return (
    <Button
      variant="primary"
      size="lg"
      data-testid="quick-add-button"
      title={t('search.quickAdd')}
      className="gap-2 rounded-full shadow-sm hover:shadow transition-all"
      onClick={() => setOpen(true)}
    >
      <Plus className="h-4 w-4" />
      {t('search.quickAdd')}
    </Button>
  );
}
