'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Info, Code, Heart } from 'lucide-react';
import { getAppVersion } from '@/lib/version';

export default function AboutCard() {
  const t = useTranslations('about');
  const version = getAppVersion();

  const infoItems = [
    {
      icon: Info,
      title: t('appName'),
      value: t('version') + ' ' + version,
    },
    {
      icon: Code,
      title: t('technologies'),
      value: t('techList'),
    },
    {
      icon: Heart,
      title: t('credits'),
      value: t('weatherProvider'),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 bg-white/60 dark:bg-white/5 backdrop-blur-md shadow-sm border-white/10 rounded-2xl">
        <h2 className="text-lg font-medium text-neutral-800 dark:text-white/90 mb-4 flex items-center gap-4 ltr:flex-row-reverse">
          <Info className="h-5 w-5 text-sky-500 dark:text-blue-400 flex-shrink-0" />
          <span className="rtl:text-right ltr:text-left">{t('title')}</span>
        </h2>
        
        <div className="space-y-4">
          {infoItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
              className="flex items-center gap-4 ltr:flex-row-reverse"
            >
              <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg flex-shrink-0">
                <item.icon className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="flex-1 min-w-0 rtl:text-right ltr:text-left">
                <h3 className="font-medium text-neutral-800 dark:text-white/90 text-sm">
                  {item.title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-white/60 mt-1 break-words">
                  {item.value}
                </p>
              </div>
            </motion.div>
          ))}
          
          {/* Additional credits */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.3 }}
            className="flex items-center gap-4 ltr:flex-row-reverse pt-2"
          >
            <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg flex-shrink-0">
              <Heart className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            </div>
            <div className="flex-1 min-w-0 rtl:text-right ltr:text-left">
              <p className="text-sm text-neutral-600 dark:text-white/60">
                {t('icons')}
              </p>
            </div>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}
