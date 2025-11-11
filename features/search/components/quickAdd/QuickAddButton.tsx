'use client';

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { useQuickAddStore } from '@/features/search/store/useQuickAddStore';

interface QuickAddButtonProps {
  onClick?: () => void;
}

const QuickAddButton = ({ onClick }: QuickAddButtonProps) => {
  const t = useTranslations();
  const setOpen = useQuickAddStore((state) => state.setOpen);

  const handleClick = () => {
    setOpen(true);
    onClick?.();
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}>
      <Button
        variant="primary"
        size="lg"
        onClick={handleClick}
        className="flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary/90 px-6 font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
      >
        <Plus className="h-5 w-5" aria-hidden="true" />
        <span>{t('search.addCity')}</span>
      </Button>
    </motion.div>
  );
};

export default QuickAddButton;


