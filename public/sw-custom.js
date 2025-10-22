// Custom Service Worker for Weather App
// Extends the default Next.js PWA service worker with location change notifications

importScripts('./sw.js');

// Location change notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    
    if (data.type === 'location-change') {
      const options = {
        body: data.body || 'Your location has changed',
        icon: data.icon || '/icons/icon-192x192.png',
        badge: data.badge || '/icons/icon-192x192.png',
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
        self.registration.showNotification(data.title || 'Location Changed', options)
      );
    }
  } catch (error) {
    console.error('Error handling location change push:', error);
  }
});

// Handle notification clicks for location changes
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action) {
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
          clients[0].focus();
        } else {
          self.clients.openWindow('/');
        }
      })
    );
  }
});

console.log('Custom Service Worker with location handling loaded');
