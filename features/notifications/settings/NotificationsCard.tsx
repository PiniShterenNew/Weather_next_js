'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, Settings, AlertCircle, Loader2 } from 'lucide-react';
import { useWeatherDataStore } from '@/features/weather/store/useWeatherDataStore';
import { useToastStore } from '@/features/ui/store/useToastStore';
import { fetchSecure } from '@/lib/fetchSecure';
import { useUser } from '@clerk/nextjs';
import { AppLocale } from '@/types/i18n';

interface NotificationSettings {
  enabled: boolean;
  permissionGranted: boolean;
}

export default function NotificationsCard() {
  const t = useTranslations('notifications');
  const locale = useLocale() as AppLocale;
  const { user } = useUser();
  const cities = useWeatherDataStore((state) => state.cities);
  const showToast = useToastStore((state) => state.showToast);
  
  const isRTL = locale === 'he';
  
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    permissionGranted: false,
  });
  const [isClient, setIsClient] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Track client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Load settings from localStorage
    const savedSettings = window.localStorage.getItem('notificationSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings({
        enabled: parsedSettings.enabled || false,
        permissionGranted: parsedSettings.permissionGranted || false,
      });
    }
    
    // Check notification permission
    if ('Notification' in window) {
      setSettings(prev => ({
        ...prev,
        permissionGranted: Notification.permission === 'granted'
      }));
    }
  }, [isClient]);

  // Load notification preferences from database when user is available
  // Note: The preferences are already loaded via useUserSync hook,
  // but this ensures we have the latest notification settings
  useEffect(() => {
    // We'll update this later if needed - for now, we rely on localStorage
    // and database saves when settings change
  }, [user?.id]);

  const announceStatus = (type: 'idle' | 'loading' | 'success' | 'error', message: string) => {
    setStatusType(type);
    setStatusMessage(message);
  };

  // Fixed notification times - no need to sync local time states


  const saveSettings = async (newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    const successMessage = t(updatedSettings.enabled ? 'enabled' : 'disabled');
    setSettings(updatedSettings);
    announceStatus('loading', t('loading'));
    
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('notificationSettings', JSON.stringify(updatedSettings));
    }

    if (user?.id) {
      try {
        const response = await fetchSecure('/api/user/preferences', {
          method: 'POST',
          requireAuth: true,
          body: JSON.stringify({
            notifications: {
              enabled: updatedSettings.enabled,
            },
          }),
        });
        
        if (response.ok) {
          showToast({
            message: updatedSettings.enabled ? 'notifications.enabled' : 'notifications.disabled',
            type: 'success',
          });
          announceStatus('success', successMessage);
        } else {
          showToast({
            message: 'toasts.error',
            type: 'error',
          });
          announceStatus('error', t('toasts.error'));
        }
      } catch {
        showToast({
          message: 'toasts.error',
          type: 'error',
        });
        announceStatus('error', t('toasts.error'));
      }
    } else {
      announceStatus('success', successMessage);
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      showToast({
        message: 'notifications.permissionDenied',
        type: 'error',
      });
      announceStatus('error', t('permissionDenied'));
      return;
    }

    announceStatus('loading', t('loading'));
    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    
    if (granted) {
      try {
        const { registerForPushNotifications } = await import('@/features/notifications/sw/registerPush');
        const subscription = await registerForPushNotifications();
        
        if (subscription) {
          const response = await fetchSecure('/api/notifications/subscribe', {
            method: 'POST',
            requireAuth: true,
            body: JSON.stringify({
              ...subscription,
            }),
          });

          if (response.ok) {
            setSettings(prev => ({
              ...prev,
              permissionGranted: true,
              enabled: true,
            }));
            announceStatus('success', t('permissionGranted'));
          } else {
            throw new Error('Failed to save subscription');
          }
        }
      } catch {
        showToast({
          message: 'notifications.permissionDenied',
          type: 'error',
        });
        announceStatus('error', t('permissionDenied'));
      }
    } else {
      setSettings(prev => ({
        ...prev,
        permissionGranted: false,
        enabled: false,
      }));

      showToast({
        message: 'notifications.permissionDenied',
        type: 'error',
      });
      announceStatus('error', t('permissionDenied'));
    }
  };

  const toggleNotifications = async (enabled: boolean) => {
    try {
      if (enabled && !settings.permissionGranted) {
        announceStatus('loading', t('loading'));
        await requestPermission();
        return;
      }

      announceStatus('loading', t('loading'));

      if (!enabled && settings.permissionGranted) {
        const { unregisterFromPushNotifications } = await import('@/features/notifications/sw/registerPush');
        const result = await unregisterFromPushNotifications();
        
        if (result.success && result.endpoint) {
          await fetchSecure(`/api/notifications/subscribe?endpoint=${encodeURIComponent(result.endpoint)}`, {
            method: 'DELETE',
            requireAuth: true,
          });
        }

        await saveSettings({ enabled: false });
      } else if (enabled && settings.permissionGranted) {
        const { registerForPushNotifications } = await import('@/features/notifications/sw/registerPush');
        const subscription = await registerForPushNotifications();
        
        if (subscription) {
          const response = await fetchSecure('/api/notifications/subscribe', {
            method: 'POST',
            requireAuth: true,
            body: JSON.stringify({
              ...subscription,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to save subscription');
          }
        }

        await saveSettings({ enabled: true });
      } else {
        await saveSettings({ enabled });
      }
    } catch (error) {
      const fallbackMessage =
        error instanceof Error && error.message
          ? error.message
          : t('permissionDenied');
      announceStatus('error', fallbackMessage);
      if (enabled) {
        setSettings((prev) => ({ ...prev, enabled: false }));
      }
    }
  };

  const hasCities = cities && cities.length > 0;
  const isBusy = statusType === 'loading';
  const liveMessage = statusMessage || (isClient ? '' : t('loading'));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 bg-white/60 dark:bg-white/5 backdrop-blur-md shadow-sm border-white/10 rounded-2xl">
        <h2 className="text-lg font-medium text-neutral-800 dark:text-white/90 mb-4 flex items-center gap-3">
          <Bell className="h-5 w-5 text-sky-500 dark:text-blue-400" />
          {t('title')}
        </h2>
        
        <div className="space-y-4">
          {/* Description */}
          <p className="text-sm text-neutral-600 dark:text-white/60">
            {t('description')}
          </p>

          {/* No cities warning */}
          {!hasCities && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  {t('noCitiesDescription')}
                </p>
              </div>
            </motion.div>
          )}

          {/* Enable toggle */}
          <div className="flex items-center justify-between">
            <div className={isRTL ? 'text-right' : ''}>
              <h3 className="font-medium text-neutral-800 dark:text-white/90">
                {t('enable')}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-white/60">
                {!isClient ? t('loading') : settings.permissionGranted 
                  ? (hasCities ? t('enableDescription') : t('noCitiesDescription'))
                  : t('permissionDeniedDescription')
                }
              </p>
            </div>
            <Switch
              checked={isClient ? (settings.enabled && settings.permissionGranted && hasCities) : false}
              onCheckedChange={toggleNotifications}
              disabled={!hasCities || !isClient || isBusy}
              aria-busy={isBusy}
              isRTL={isRTL}
            />
          </div>

          {/* Permission denied state */}
          {isClient && !settings.permissionGranted && hasCities && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
            >
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <p className={`text-sm text-red-800 dark:text-red-200 ${isRTL ? 'text-right' : ''}`}>
                    {t('permissionDenied')}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={requestPermission}
                  disabled={isBusy}
                  className={`text-red-700 border-red-300 hover:bg-red-50 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-900/30 ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  {isBusy ? (
                    <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                  ) : (
                    <Settings className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                  )}
                  {t('openSettings')}
                </Button>
              </div>
            </motion.div>
          )}

          <p
            className={`text-xs ${statusType === 'error' ? 'text-red-600 dark:text-red-400' : 'text-neutral-500 dark:text-white/60'}`}
            role="status"
            aria-live="polite"
          >
            {liveMessage}
          </p>

        </div>
      </Card>
    </motion.div>
  );
}
