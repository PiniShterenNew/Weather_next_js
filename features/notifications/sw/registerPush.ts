import { logger } from '@/lib/errors';

/**
 * Push notification registration utilities
 */

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Register for push notifications
 */
export async function registerForPushNotifications(): Promise<PushSubscriptionData | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    logger.warn('Push messaging is not supported');
    return null;
  }

  if (process.env.NODE_ENV !== 'production' || !window.isSecureContext || window.location.protocol !== 'https:') {
    logger.warn('Push notifications require a secure production environment; skipping registration.');
    throw new Error('Push notifications are only available in production environments.');
  }

  try {
    // Register service worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    logger.debug('Service Worker registered successfully');

    // Check if we already have a subscription
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Create new subscription
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        logger.error('VAPID public key not found');
        return null;
      }

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });
    }

    // Convert subscription to our format
    const subscriptionData: PushSubscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: arrayBufferToBase64(subscription.getKey('auth')!),
      },
    };

    return subscriptionData;
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Push registration failed');
    logger.error('Error registering for push notifications', err);
    throw err;
  }
}

/**
 * Unregister from push notifications
 */
export async function unregisterFromPushNotifications(): Promise<{ success: boolean; endpoint?: string }> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { success: false };
  }
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        return { success: true, endpoint };
      }
    }
    return { success: false };
  } catch (error) {
    logger.error('Error unregistering from push notifications', error as Error);
    return { success: false };
  }
}

/**
 * Check if push notifications are supported
 */
export function isPushNotificationSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Check current notification permission
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return await Notification.requestPermission();
}

/**
 * Convert VAPID key to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Convert ArrayBuffer to base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
