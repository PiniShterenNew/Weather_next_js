import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  preloadCriticalResources, 
  getOptimizedCurrentPosition, 
  batchWeatherRequests,
  preloadWeatherIcons,
  debounce,
  createIntersectionObserver,
  optimizeMemoryUsage,
  registerServiceWorker
} from '@/lib/performance-optimizations';

// Mock DOM APIs
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn()
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true
});

// Mock DOM methods
Object.defineProperty(global.document, 'createElement', {
  value: vi.fn(() => ({
    rel: '',
    as: '',
    href: '',
    type: '',
    crossOrigin: '',
    src: ''
  })),
  writable: true
});

Object.defineProperty(global.document.head, 'appendChild', {
  value: vi.fn(),
  writable: true
});

// Mock Image constructor
global.Image = vi.fn(() => ({
  src: ''
})) as any;

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
})) as any;

// Mock Service Worker
Object.defineProperty(global.navigator, 'serviceWorker', {
  value: {
    register: vi.fn()
  },
  writable: true
});

describe('Performance Optimizations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('preloadCriticalResources', () => {
    it('should preload weather icons and fonts', () => {
      preloadCriticalResources();
      
      expect(document.createElement).toHaveBeenCalledWith('link');
      expect(document.head.appendChild).toHaveBeenCalled();
    });
  });

  describe('getOptimizedCurrentPosition', () => {
    it('should return geolocation with optimized settings', async () => {
      const mockPosition = { coords: { latitude: 32.0853, longitude: 34.7818 } };
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      const result = await getOptimizedCurrentPosition();
      
      expect(result).toBe(mockPosition);
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        {
          enableHighAccuracy: false,
          maximumAge: 60000,
          timeout: 5000
        }
      );
    });

    it('should reject if geolocation is not supported', async () => {
      Object.defineProperty(global.navigator, 'geolocation', {
        value: undefined,
        writable: true
      });

      await expect(getOptimizedCurrentPosition()).rejects.toThrow('Geolocation not supported');
    });
  });

  describe('batchWeatherRequests', () => {
    it('should process requests in batches', async () => {
      const requests = [
        () => Promise.resolve('result1'),
        () => Promise.resolve('result2'),
        () => Promise.resolve('result3'),
        () => Promise.resolve('result4'),
        () => Promise.resolve('result5')
      ];

      const results = await batchWeatherRequests(requests);
      
      expect(results).toHaveLength(5);
      expect(results).toEqual(['result1', 'result2', 'result3', 'result4', 'result5']);
    });

    it('should handle failed requests', async () => {
      const requests = [
        () => Promise.resolve('result1'),
        () => Promise.reject(new Error('Failed')),
        () => Promise.resolve('result3')
      ];

      const results = await batchWeatherRequests(requests);
      
      expect(results).toHaveLength(3);
      expect(results[0]).toBe('result1');
      expect(results[1]).toBeNull();
      expect(results[2]).toBe('result3');
    });
  });

  describe('preloadWeatherIcons', () => {
    it('should preload weather icons', () => {
      const weatherCodes = ['01d', '02d', '03d'];
      
      preloadWeatherIcons(weatherCodes);
      
      expect(global.Image).toHaveBeenCalledTimes(3);
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1');
      debouncedFn('arg2');
      debouncedFn('arg3');

      expect(mockFn).not.toHaveBeenCalled();

      await new Promise(resolve => setTimeout(resolve, 150));

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('arg3');
    });
  });

  describe('createIntersectionObserver', () => {
    it('should create intersection observer with default options', () => {
      const callback = vi.fn();
      const observer = createIntersectionObserver(callback);

      expect(global.IntersectionObserver).toHaveBeenCalledWith(callback, {
        rootMargin: '50px',
        threshold: 0.1
      });
    });

    it('should create intersection observer with custom options', () => {
      const callback = vi.fn();
      const options = { rootMargin: '100px', threshold: 0.5 };
      const observer = createIntersectionObserver(callback, options);

      expect(global.IntersectionObserver).toHaveBeenCalledWith(callback, options);
    });
  });

  describe('optimizeMemoryUsage', () => {
    it('should return items if under limit', () => {
      const items = [1, 2, 3, 4, 5];
      const result = optimizeMemoryUsage(items, 10);

      expect(result).toBe(items);
    });

    it('should limit items to maxItems', () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      const result = optimizeMemoryUsage(items, 10);

      expect(result).toHaveLength(10);
      expect(result).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    });
  });

  describe('registerServiceWorker', () => {
    it('should register service worker successfully', async () => {
      const mockRegistration = { scope: '/' };
      (global.navigator.serviceWorker.register as any).mockResolvedValue(mockRegistration);

      const result = await registerServiceWorker();

      expect(result).toBe(mockRegistration);
      expect(global.navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js');
    });

    it('should return null if service worker not supported', async () => {
      Object.defineProperty(global.navigator, 'serviceWorker', {
        value: undefined,
        writable: true
      });

      const result = await registerServiceWorker();

      expect(result).toBeNull();
    });

    it('should return null if registration fails', async () => {
      // Re-setup service worker mock for this test
      Object.defineProperty(global.navigator, 'serviceWorker', {
        value: {
          register: vi.fn().mockRejectedValue(new Error('Failed'))
        },
        writable: true
      });

      const result = await registerServiceWorker();

      expect(result).toBeNull();
    });
  });
});
