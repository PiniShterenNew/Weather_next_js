'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { AlertTriangle, Trash2, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  icon?: 'trash' | 'warning' | 'info';
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  variant = 'danger',
  icon = 'warning',
}: ConfirmDialogProps) {
  const t = useTranslations('common');

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const IconComponent = 
    icon === 'trash' ? Trash2 :
    icon === 'info' ? Info :
    AlertTriangle;

  const iconColor =
    variant === 'danger' ? 'text-red-500 dark:text-red-400' :
    variant === 'warning' ? 'text-amber-500 dark:text-amber-400' :
    'text-sky-500 dark:text-sky-400';

  const confirmButtonColor =
    variant === 'danger' 
      ? 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white border-red-500'
      : variant === 'warning'
      ? 'bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white border-amber-500'
      : 'bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700 text-white border-sky-500';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:w-[calc(100vw-3rem)] max-w-none bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-2 border-white/20 dark:border-gray-700/50 rounded-2xl shadow-2xl p-4 sm:p-6">
        <DialogHeader>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="mx-auto mb-4"
          >
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${
              variant === 'danger' ? 'from-red-100 to-red-200 dark:from-red-950/50 dark:to-red-900/50' :
              variant === 'warning' ? 'from-amber-100 to-amber-200 dark:from-amber-950/50 dark:to-amber-900/50' :
              'from-sky-100 to-sky-200 dark:from-sky-950/50 dark:to-sky-900/50'
            } flex items-center justify-center shadow-lg`}>
              <IconComponent className={`h-8 w-8 ${iconColor}`} />
            </div>
          </motion.div>

          <DialogTitle className="text-center text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </DialogTitle>
          
          <DialogDescription className="text-center text-gray-600 dark:text-gray-400 mt-2 text-base">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto order-2 sm:order-1 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {cancelText || t('cancel')}
          </Button>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            <Button
              onClick={handleConfirm}
              className={`w-full rounded-xl font-semibold shadow-lg transition-all ${confirmButtonColor}`}
            >
              {confirmText || t('confirm')}
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

