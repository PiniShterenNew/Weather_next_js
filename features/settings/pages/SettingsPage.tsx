'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Trash2, Database, LogOut, Globe, Palette, Thermometer, HardDrive, User, Info, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LanguageSwitcher, ThemeSwitcher, TemperatureUnitToggle } from '@/features/settings';
import { useWeatherStore } from '@/store/useWeatherStore';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOnboardingGate } from '@/features/onboarding';
import NotificationsCard from '@/features/notifications/settings/NotificationsCard';

export interface SettingsPageProps {
  isAuthenticated?: boolean;
  onSignOut?: () => void;
}

export default function SettingsPage({ isAuthenticated = false, onSignOut }: SettingsPageProps) {
  const t = useTranslations();
  const router = useRouter();
  const resetStore = useWeatherStore((s) => s.resetStore);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showClearCacheDialog, setShowClearCacheDialog] = useState(false);
  const [showResetWelcomeDialog, setShowResetWelcomeDialog] = useState(false);
  const { resetWelcome, shouldShowWelcome } = useOnboardingGate();
  const [isClient, setIsClient] = useState(false);

  // Track client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleClearCacheConfirm = () => {
    if (typeof window !== 'undefined') {
      // Clear localStorage
      window.localStorage.clear();
      // Clear sessionStorage
      window.sessionStorage.clear();
      // Show toast
      useWeatherStore.getState().showToast({
        message: 'settings.cacheCleared',
        type: 'info',
      });
    }
  };

  const handleResetStoreConfirm = () => {
    resetStore();
    useWeatherStore.getState().showToast({
      message: 'settings.storeReset',
      type: 'success',
    });
  };

  const handleResetWelcomeConfirm = () => {
    resetWelcome();
    useWeatherStore.getState().showToast({
      message: 'onboarding.resetWelcome',
      type: 'success',
    });
  };

  return (
    <div className="!max-h-[calc(100vh-10rem)] overflow-y-auto overflow-x-hidden scroll-smooth scrollbar-hide bg-gradient-to-b from-blue-50 to-white dark:from-[#0d1117] dark:to-[#1b1f24]">
      <div className="flex flex-col space-y-6 px-4 sm:px-6 pt-6 w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-white/90">
          {t('navigation.settings')}
        </h1>
        <p className="text-sm text-neutral-600 dark:text-white/80 mt-1">
          {t('settings.description')}
        </p>
      </motion.div>

      {/* Language Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
      <Card className="p-6 bg-white/60 dark:bg-white/5 backdrop-blur-md shadow-sm border-white/10 rounded-2xl">
        <h2 className="text-lg font-medium text-neutral-800 dark:text-white/90 mb-4 flex items-center gap-3">
          <Globe className="h-5 w-5 text-sky-500 dark:text-blue-400" />
          {t('settings.language')}
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600 dark:text-white/80">
              {t('settings.languageDescription')}
            </p>
          </div>
          <LanguageSwitcher />
        </div>
      </Card>
      </motion.div>

      {/* Theme Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
      <Card className="p-6 bg-white/60 dark:bg-white/5 backdrop-blur-md shadow-sm border-white/10 rounded-2xl">
        <h2 className="text-lg font-medium text-neutral-800 dark:text-white/90 mb-4 flex items-center gap-3">
          <Palette className="h-5 w-5 text-sky-500 dark:text-blue-400" />
          {t('settings.theme')}
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600 dark:text-white/80">
              {t('settings.themeDescription')}
            </p>
          </div>
          <ThemeSwitcher />
        </div>
      </Card>
      </motion.div>

      {/* Temperature Unit Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
      <Card className="p-6 bg-white/60 dark:bg-white/5 backdrop-blur-md shadow-sm border-white/10 rounded-2xl">
        <h2 className="text-lg font-medium text-neutral-800 dark:text-white/90 mb-4 flex items-center gap-3">
          <Thermometer className="h-5 w-5 text-sky-500 dark:text-blue-400" />
          {t('settings.temperatureUnit')}
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600 dark:text-white/80">
              {t('settings.temperatureUnitDescription')}
            </p>
          </div>
          <TemperatureUnitToggle />
        </div>
      </Card>
      </motion.div>

      {/* Data Management Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
      <Card className="p-6 bg-white/60 dark:bg-white/5 backdrop-blur-md shadow-sm border-white/10 rounded-2xl">
        <h2 className="text-lg font-medium text-neutral-800 dark:text-white/90 mb-4 flex items-center gap-3">
          <HardDrive className="h-5 w-5 text-sky-500 dark:text-blue-400" />
          {t('settings.dataManagement')}
        </h2>
        <div className="space-y-4">
          {/* Clear Cache Button */}
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-neutral-800 dark:text-white/90">
                {t('settings.clearCache')}
              </p>
              <p className="text-sm text-neutral-600 dark:text-white/80">
                {t('settings.clearCacheDescription')}
              </p>
            </div>
            <Button
              variant="outline"
              size="md"
              onClick={() => setShowClearCacheDialog(true)}
              className="gap-2 w-full"
            >
              <Database className="h-4 w-4" />
              {t('settings.clear')}
            </Button>
          </div>

          {/* Reset Store Button */}
          <div className="space-y-3 pt-4 border-t border-white/20 dark:border-white/10">
            <div>
              <p className="text-sm font-medium text-neutral-800 dark:text-white/90">
                {t('settings.resetStore')}
              </p>
              <p className="text-sm text-neutral-600 dark:text-white/80">
                {t('settings.resetStoreDescription')}
              </p>
            </div>
            <Button
              variant="outline"
              size="md"
              onClick={() => setShowResetDialog(true)}
              className="gap-2 w-full text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
            >
              <Trash2 className="h-4 w-4" />
              {t('settings.reset')}
            </Button>
          </div>
        </div>
      </Card>
      </motion.div>

      {/* Notifications Section */}
      <NotificationsCard />

      {/* About Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <Card className="p-6 bg-white/60 dark:bg-white/5 backdrop-blur-md shadow-sm border-white/10 rounded-2xl">
          <h2 className="text-lg font-medium text-neutral-800 dark:text-white/90 mb-4 flex items-center gap-3">
            <Info className="h-5 w-5 text-sky-500 dark:text-blue-400" />
            {t('about.title')}
          </h2>
          <div className="flex flex-col space-y-3 rtl:gap-3">
            <div>
              <p className="text-sm text-neutral-600 dark:text-white/80">
                {t('about.appName')} - {t('about.version')} {process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0'}
              </p>
            </div>
            <Button
              variant="outline"
              size="md"
              onClick={() => router.push('/settings/about')}
              className="gap-2 w-full"
            >
              <Info className="h-4 w-4" />
              {t('about.title')}
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Reset Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.55 }}
      >
        <Card className="p-6 bg-white/60 dark:bg-white/5 backdrop-blur-md shadow-sm border-white/10 rounded-2xl">
          <h2 className="text-lg font-medium text-neutral-800 dark:text-white/90 mb-4 flex items-center gap-3">
            <RotateCcw className="h-5 w-5 text-sky-500 dark:text-blue-400" />
            {t('onboarding.resetWelcome')}
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-neutral-600 dark:text-white/80 text-center">
                {t('onboarding.resetWelcomeDescription')}
              </p>
            </div>
            <Button
              variant="outline"
              size="md"
              onClick={() => setShowResetWelcomeDialog(true)}
              disabled={isClient ? shouldShowWelcome === true : false}
              className="gap-2 w-full"
            >
              <RotateCcw className="h-4 w-4" />
              {t('onboarding.resetWelcome')}
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Auth Section - Only show if authenticated */}
      {isAuthenticated && onSignOut && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
        <Card className="p-6 bg-white/60 dark:bg-white/5 backdrop-blur-md shadow-sm border-white/10 rounded-2xl">
          <h2 className="text-lg font-medium text-neutral-800 dark:text-white/90 mb-4 flex items-center gap-3">
            <User className="h-5 w-5 text-sky-500 dark:text-blue-400" />
            {t('settings.account')}
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-white/80">
                {t('settings.signOutDescription')}
              </p>
            </div>
            <Button
              variant="outline"
              size="md"
              onClick={onSignOut}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              {t('auth.signOut')}
            </Button>
          </div>
        </Card>
        </motion.div>
      )}

      {/* Clear Cache Confirmation Dialog */}
      <ConfirmDialog
        open={showClearCacheDialog}
        onOpenChange={setShowClearCacheDialog}
        onConfirm={handleClearCacheConfirm}
        title={t('settings.clearCacheTitle')}
        description={t('settings.confirmClearCache')}
        confirmText={t('settings.clear')}
        variant="warning"
        icon="warning"
      />

      {/* Reset Store Confirmation Dialog */}
      <ConfirmDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
        onConfirm={handleResetStoreConfirm}
        title={t('settings.resetStoreTitle')}
        description={t('settings.confirmReset')}
        confirmText={t('settings.reset')}
        variant="danger"
        icon="trash"
      />

      {/* Reset Welcome Confirmation Dialog */}
      <ConfirmDialog
        open={showResetWelcomeDialog}
        onOpenChange={setShowResetWelcomeDialog}
        onConfirm={handleResetWelcomeConfirm}
        title={t('onboarding.resetWelcome')}
        description={t('onboarding.resetWelcomeDescription')}
        confirmText={t('onboarding.resetWelcome')}
        variant="info"
        icon="info"
      />
      </div>
    </div>
  );
}

