/**
 * Push notification payload types and utilities
 */

export interface WeatherNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: {
    city: string;
    temperature: number;
    description: string;
    timestamp: number;
  };
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

/**
 * Create weather notification payload
 */
export function createWeatherNotificationPayload(
  title: string,
  body: string,
  city: string,
  temperature: number,
  description: string
): WeatherNotificationPayload {
  return {
    title,
    body,
    icon: '/icons/weather-notification.png',
    badge: '/icons/badge-72x72.png',
    tag: `weather-${city.toLowerCase().replace(/\s+/g, '-')}`,
    data: {
      city,
      temperature,
      description,
      timestamp: Date.now(),
    },
    actions: [
      {
        action: 'view',
        title: 'View Weather',
        icon: '/icons/view-weather.png',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss.png',
      },
    ],
  };
}

/**
 * Show local notification (for testing)
 */
export function showLocalNotification(payload: WeatherNotificationPayload): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const options: NotificationOptions = {
    body: payload.body,
    icon: payload.icon,
    badge: payload.badge,
    tag: payload.tag,
    data: payload.data,
    // @ts-expect-error: 'actions' not yet included in TS NotificationOptions type
    actions: payload.actions,
  };

  const notification = new Notification(payload.title, options);

  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}
