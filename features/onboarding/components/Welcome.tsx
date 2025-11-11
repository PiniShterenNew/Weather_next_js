'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Cloud, WifiOff } from 'lucide-react';
import { useOnboardingGate } from '../hooks/useOnboardingGate';
import AuthHeader from '@/features/auth/components/AuthHeader';

export default function Welcome() {
  const t = useTranslations('onboarding');
  const router = useRouter();
  const { markWelcomeAsSeen } = useOnboardingGate();

  const handleGetStarted = () => {
    markWelcomeAsSeen();
    router.push('/');
  };

  const features = [
    {
      icon: MapPin,
      title: t('features.addCities'),
      description: 'Add multiple cities to track weather',
    },
    {
      icon: Cloud,
      title: t('features.getForecasts'),
      description: 'Get detailed weather forecasts',
    },
    {
      icon: WifiOff,
      title: t('features.worksOffline'),
      description: 'Works even without internet connection',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-[#0d1117] dark:to-[#1b1f24]">
      <AuthHeader />
      <div className="flex items-center justify-center p-4 pt-20">
        <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-white/90">
            {t('title')}
          </h1>
          <p className="text-lg text-neutral-600 dark:text-white/60">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
            >
              <Card className="p-4 bg-white/60 dark:bg-white/5 backdrop-blur-md shadow-sm border-white/10 rounded-2xl">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-xl">
                    <feature.icon className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-800 dark:text-white/90">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-white/60">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="pt-4"
        >
          <Button
            onClick={handleGetStarted}
            className="w-full h-12 text-lg font-medium bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {t('cta')}
          </Button>
        </motion.div>
        </div>
      </div>
    </div>
  );
}
