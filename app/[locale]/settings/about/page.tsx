'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import AboutCard from '@/features/settings/components/AboutCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  const router = useRouter();
  const t = useTranslations();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="h-screen bg-gradient-to-b from-blue-50 to-white dark:from-[#0d1117] dark:to-[#1b1f24] flex flex-col"
    >
      {/* Header with Back Button */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex items-center justify-between p-4 pt-6"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="gap-2 rtl:flex-row-reverse bg-white/60 dark:bg-white/5 backdrop-blur-md border-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('navigation.back')}
        </Button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('about.title')}
        </h1>
        <div className="w-20"></div> {/* Spacer for centering */}
      </motion.div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex-1 flex items-center justify-center px-4 sm:px-6 pb-6"
      >
        <div className="w-full max-w-md mx-auto">
          <AboutCard />
        </div>
      </motion.div>
    </motion.div>
  );
}
