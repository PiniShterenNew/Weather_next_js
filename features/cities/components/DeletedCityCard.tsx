'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Trash2, RotateCcw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface DeletedCityCardProps {
  cityName: string;
  onUndo: () => void;
  onConfirmDelete: () => void;
}

export default function DeletedCityCard({
  cityName,
  onUndo,
  onConfirmDelete
}: DeletedCityCardProps) {
  const t = useTranslations();

  return (
    <motion.div
      initial={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trash2 className="h-5 w-5 text-red-500" />
            <span className="text-red-700 dark:text-red-300 font-medium">
              {t('cities.cityDeleted', { city: cityName })}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onUndo}
              className="text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              {t('common.undo')}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={onConfirmDelete}
              className="text-xs"
            >
              {t('common.confirm')}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

