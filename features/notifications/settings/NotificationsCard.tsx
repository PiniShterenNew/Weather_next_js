'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, Settings, AlertCircle } from 'lucide-react';
import { useWeatherStore } from '@/store/useWeatherStore';
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
  const cities = useWeatherStore((s) => s.cities);
  // const unit = useWeatherStore((s) => s.unit);
  
  const isRTL = locale === 'he';
  
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    permissionGranted: false,
  });

  useEffect(() => {
    // Load settings from localStorage
    if (typeof window !== 'undefined') {
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
    }
  }, []);

  // Load notification preferences from database when user is available
  // Note: The preferences are already loaded via useUserSync hook,
  // but this ensures we have the latest notification settings
  useEffect(() => {
    // We'll update this later if needed - for now, we rely on localStorage
    // and database saves when settings change
  }, [user?.id]);

  // Fixed notification times - no need to sync local time states


  const saveSettings = async (newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    // Save to localStorage for immediate UI update
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('notificationSettings', JSON.stringify(updatedSettings));
    }

    // Save to database if user is authenticated
    if (user?.id) {
      try {
        // eslint-disable-next-line no-console
        console.log('Saving notification preferences to database:', {
          enabled: updatedSettings.enabled,
        });
        
        const response = await fetch('/api/user/preferences', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            notifications: {
              enabled: updatedSettings.enabled,
            },
          }),
        });
        
        if (response.ok) {
          // eslint-disable-next-line no-console
          console.log('Notification preferences saved successfully');
        } else {
          // eslint-disable-next-line no-console
          console.error('Failed to save notification preferences:', response.status);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error saving notification preferences:', error);
      }
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      useWeatherStore.getState().showToast({
        message: 'notifications.permissionDenied',
        type: 'error',
      });
      return;
    }

    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    
    if (granted) {
      // Register for push notifications
      try {
        const { registerForPushNotifications } = await import('@/features/notifications/sw/registerPush');
        const subscription = await registerForPushNotifications();
        
        if (subscription) {
          // eslint-disable-next-line no-console
          console.log('Sending subscription to server:', {
            userId: user?.id,
            endpoint: subscription.endpoint
          });
          
          // Send subscription to server
          const response = await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...subscription,
              userId: user?.id,
            }),
          });

          if (response.ok) {
            setSettings(prev => ({
              ...prev,
              permissionGranted: true,
              enabled: true
            }));

          } else {
            throw new Error('Failed to save subscription');
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error registering for push notifications:', error);
        useWeatherStore.getState().showToast({
          message: 'notifications.permissionDenied',
          type: 'error',
        });
      }
    } else {
      setSettings(prev => ({
        ...prev,
        permissionGranted: false,
        enabled: false
      }));

      useWeatherStore.getState().showToast({
        message: 'notifications.permissionDenied',
        type: 'error',
      });
    }
  };

  const toggleNotifications = async (enabled: boolean) => {
    if (enabled && !settings.permissionGranted) {
      requestPermission();
      return;
    }
    
    if (!enabled && settings.permissionGranted) {
      // Unsubscribe from push notifications
      try {
        const { unregisterFromPushNotifications } = await import('@/features/notifications/sw/registerPush');
        const result = await unregisterFromPushNotifications();
        
        if (result.success && result.endpoint) {
          // Remove from server using query parameter
          await fetch(`/api/notifications/subscribe?endpoint=${encodeURIComponent(result.endpoint)}`, {
            method: 'DELETE',
          });

          // Update state regardless of server response
          await saveSettings({ enabled: false });
        } else {
          // Still update the UI state even if unsubscribe failed
          await saveSettings({ enabled: false });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error unsubscribing from push notifications:', error);
        // Still update the UI state even if there was an error
        await saveSettings({ enabled: false });
        useWeatherStore.getState().showToast({
          message: 'notifications.permissionDenied',
          type: 'error',
        });
      }
    } else if (enabled && settings.permissionGranted) {
      // User wants to enable notifications and has permission
      // Check if we need to register for push notifications
      try {
        const { registerForPushNotifications } = await import('@/features/notifications/sw/registerPush');
        const subscription = await registerForPushNotifications();
        
        if (subscription) {
          // eslint-disable-next-line no-console
          console.log('Re-registering subscription to server:', {
            userId: user?.id,
            endpoint: subscription.endpoint
          });
          
          // Send subscription to server
          const response = await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...subscription,
              userId: user?.id,
            }),
          });

          if (response.ok) {
            await saveSettings({ enabled: true });
          } else {
            throw new Error('Failed to save subscription');
          }
        } else {
          // No subscription available, but still save the preference
          await saveSettings({ enabled: true });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error ensuring push subscription:', error);
        await saveSettings({ enabled: true });
      }
    } else {
      await saveSettings({ enabled });
    }
  };

  const hasCities = cities && cities.length > 0;

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
                {settings.permissionGranted 
                  ? (hasCities ? t('enableDescription') : t('noCitiesDescription'))
                  : t('permissionDeniedDescription')
                }
              </p>
            </div>
            <Switch
              checked={settings.enabled && settings.permissionGranted && hasCities}
              onCheckedChange={toggleNotifications}
              disabled={!hasCities}
              isRTL={isRTL}
            />
          </div>

          {/* Permission denied state */}
          {!settings.permissionGranted && hasCities && (
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
                  className={`text-red-700 border-red-300 hover:bg-red-50 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-900/30 ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <Settings className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                  {t('openSettings')}
                </Button>
              </div>
            </motion.div>
          )}

        </div>
      </Card>
    </motion.div>
  );
}
