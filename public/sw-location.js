// Service Worker for Location Change Notifications
// This file handles push notifications for location changes

const CACHE_NAME = 'weather-app-location-v1';
const NOTIFICATION_TITLE = 'Location Changed';
const NOTIFICATION_ICON = '/icons/weather-192.png';

// Install event
self.addEventListener('install', (event) => {
  console.log('Location Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Location Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  if (!event.data) {
    console.log('Push event but no data');
    return;
  }

  try {
    const data = event.data.json();
    console.log('Push data:', data);

    // Handle location change notifications
    if (data.type === 'location-change') {
      const options = {
        body: data.body || 'Your location has changed',
        icon: data.icon || NOTIFICATION_ICON,
        badge: data.badge || NOTIFICATION_ICON,
        tag: 'location-change',
        data: data.data || {},
        actions: data.actions || [
          {
            action: 'keep-old-city',
            title: 'Keep old city',
            icon: '/icons/check.png',
          },
          {
            action: 'remove-old-city',
            title: 'Remove old city',
            icon: '/icons/close.png',
          },
        ],
        requireInteraction: true,
        silent: false,
      };

      event.waitUntil(
        self.registration.showNotification(data.title || NOTIFICATION_TITLE, options)
      );
    }
  } catch (error) {
    console.error('Error handling push event:', error);
    
    // Fallback notification
    const options = {
      body: 'You have a new notification',
      icon: NOTIFICATION_ICON,
      badge: NOTIFICATION_ICON,
    };

    event.waitUntil(
      self.registration.showNotification('Weather App', options)
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action) {
    console.log('Action clicked:', event.action);
    
    // Handle specific actions
    if (event.action === 'keep-old-city' || event.action === 'remove-old-city') {
      // Send message to client about the action
      event.waitUntil(
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'location-change-action',
              action: event.action,
              data: event.notification.data,
            });
          });
        })
      );
    }
  } else {
    // Default click - open the app
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        if (clients.length > 0) {
          // Focus existing client
          clients[0].focus();
        } else {
          // Open new window
          self.clients.openWindow('/');
        }
      })
    );
  }
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});

// Message event - handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync event (if supported)
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event);
  
  if (event.tag === 'location-sync') {
    event.waitUntil(
      // Handle background location sync
      console.log('Performing background location sync')
    );
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('Periodic sync event:', event);
  
  if (event.tag === 'location-check') {
    event.waitUntil(
      // Handle periodic location check
      console.log('Performing periodic location check')
    );
  }
});

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event.reason);
});

console.log('Location Service Worker loaded');
