'use client';

import { useState, useEffect } from 'react';

import { fetchSecure } from '@/lib/fetchSecure';

import { registerForPushNotifications, unregisterFromPushNotifications } from '../sw/registerPush';

export interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: 'default',
    isSubscribed: false,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    // Check if push notifications are supported
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window && 
                       typeof Notification !== 'undefined';
    
    setState(prev => ({
      ...prev,
      isSupported,
      permission: isSupported && Notification ? Notification.permission : 'denied',
    }));

    // Check if already subscribed
    if (isSupported) {
      checkSubscriptionStatus();
    }
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        setState(prev => ({
          ...prev,
          isSubscribed: !!subscription,
        }));
      }
    } catch {
      setState(prev => ({
        ...prev,
        error: 'Failed to verify subscription status',
      }));
    }
  };

  const subscribe = async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const subscription = await registerForPushNotifications();
      
      if (!subscription) {
        throw new Error('Failed to register for push notifications');
      }

      // Send subscription to server
      const response = await fetchSecure('/api/notifications/subscribe', {
        method: 'POST',
        requireAuth: true,
        body: JSON.stringify({
          ...subscription,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription to server');
      }

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        permission: 'granted',
        isLoading: false,
      }));

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      return false;
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const unsubscribed = await unregisterFromPushNotifications();
      
      if (!unsubscribed.success || !unsubscribed.endpoint) {
        throw new Error('Failed to unsubscribe from push notifications');
      }

      const response = await fetchSecure(
        `/api/notifications/subscribe?endpoint=${encodeURIComponent(unsubscribed.endpoint)}`,
        {
          method: 'DELETE',
          requireAuth: true,
        },
      );

      if (!response.ok) {
        throw new Error('Failed to remove subscription from server');
      }

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      return false;
    }
  };

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({
        ...prev,
        permission,
      }));
      return permission;
    } catch {
      return 'denied';
    }
  };

  return {
    ...state,
    subscribe,
    unsubscribe,
    requestPermission,
    checkSubscriptionStatus,
  };
}
