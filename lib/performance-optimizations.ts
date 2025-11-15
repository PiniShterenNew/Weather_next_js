/**
 * Performance optimization utilities for the weather app
 */

// Preload critical resources
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return;

  // Preload weather icons for common weather conditions
  const commonIcons = ['01d', '01n', '02d', '02n', '03d', '03n', '04d', '04n', '09d', '09n', '10d', '10n', '11d', '11n', '13d', '13n', '50d', '50n'];
  
  commonIcons.forEach(icon => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = `/weather-icons/light/${icon}.svg`;
    document.head.appendChild(link);
  });

  // Font preloading is handled by Next.js font optimization
}

// Optimize geolocation with timeout and fallback
export function getOptimizedCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: false, // Faster, less accurate
      maximumAge: 60000, // Use cached position if less than 1 minute old
      timeout: 5000 // Reduced from 10 seconds to 5 seconds
    };

    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      options
    );
  });
}

// Batch API requests for better performance
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function batchWeatherRequests(requests: Array<() => Promise<any>>): Promise<any[]> {
  const BATCH_SIZE = 3; // Process 3 requests at a time
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results: any[] = [];
  
  for (let i = 0; i < requests.length; i += BATCH_SIZE) {
    const batch = requests.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(batch.map(req => req()));
    
    batchResults.forEach(result => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push(null);
      }
    });
  }
  
  return results;
}

// Optimize image loading
export function preloadWeatherIcons(weatherCodes: string[]) {
  if (typeof window === 'undefined') return;

  weatherCodes.forEach(code => {
    const img = new window.Image();
    img.src = `/weather-icons/light/${code}.svg`;
  });
}

// Debounce utility for search
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver(callback, defaultOptions);
}

// Memory management for large datasets
export function optimizeMemoryUsage<T>(items: T[], maxItems: number = 100): T[] {
  if (items.length <= maxItems) return items;
  
  // Keep most recent items and remove oldest
  return items.slice(-maxItems);
}

// Service Worker registration for caching
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  if (process.env.NODE_ENV !== 'production' || window.location.protocol !== 'https:') {
    // eslint-disable-next-line no-console
    console.warn('Skipping service worker registration in development/HTTP to avoid Workbox warnings.');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    // eslint-disable-next-line no-console
    console.log('Service Worker registered successfully');
    return registration;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Service Worker registration failed:', error);
    return null;
  }
}
