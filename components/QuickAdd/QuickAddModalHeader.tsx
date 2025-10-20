'use client';

import { useTranslations } from 'next-intl';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

export function QuickAddModalHeader() {
  const t = useTranslations();

  return (
    <DialogHeader className="p-6 pb-4 shrink-0 border-b border-border/50">
      <div className="flex items-center justify-between">
        <div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {t('search.addCity')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2">
            {t('search.addCityDescription')}
          </DialogDescription>
        </div>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <Plus className="h-6 w-6 text-primary" />
        </div>
      </div>
    </DialogHeader>
  );
}
