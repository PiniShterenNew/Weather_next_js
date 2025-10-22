import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePushNotifications } from '@/features/notifications/hooks/usePushNotifications';

// Mock the registerForPushNotifications function
vi.mock('@/features/notifications/sw/registerPush', () => ({
  registerForPushNotifications: vi.fn(),
  unregisterFromPushNotifications: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

const mockPushManager = {
  getSubscription: vi.fn(),
  subscribe: vi.fn(),
};

const mockRegistration = {
  pushManager: mockPushManager,
  active: {
    postMessage: vi.fn(),
  },
};

// Mock service worker
const mockServiceWorker = {
  getRegistration: vi.fn().mockResolvedValue(mockRegistration),
  register: vi.fn().mockResolvedValue(mockRegistration),
};

// Mock Notification API
const mockNotification = {
  permission: 'default',
  requestPermission: vi.fn(),
};

Object.defineProperty(global, 'Notification', {
  value: mockNotification,
  writable: true,
});

// Mock navigator.serviceWorker
Object.defineProperty(navigator, 'serviceWorker', {
  value: mockServiceWorker,
  writable: true,
});

Object.defineProperty(global.navigator, 'serviceWorker', {
  value: mockServiceWorker,
  writable: true,
});

describe('usePushNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with correct default state', () => {
    // Mock Notification support
    Object.defineProperty(global, 'Notification', {
      value: mockNotification,
      writable: true,
    });
    
    // Mock window.Notification
    Object.defineProperty(window, 'Notification', {
      value: mockNotification,
      writable: true,
    });
    
    // Mock PushManager
    Object.defineProperty(window, 'PushManager', {
      value: {},
      writable: true,
    });
    
    const { result } = renderHook(() => usePushNotifications());

    expect(result.current.isSupported).toBe(true);
    expect(result.current.permission).toBe('default');
    expect(result.current.isSubscribed).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle unsupported browsers', () => {
    // Mock unsupported browser - set Notification to undefined
    (global as any).Notification = undefined;
    (window as any).Notification = undefined;

    const { result } = renderHook(() => usePushNotifications());

    expect(result.current.isSupported).toBe(false);
    expect(result.current.permission).toBe('denied');
  });

  it('should check subscription status on mount', async () => {
    // Mock Notification support
    Object.defineProperty(global, 'Notification', {
      value: mockNotification,
      writable: true,
    });
    
    // Mock window.Notification
    Object.defineProperty(window, 'Notification', {
      value: mockNotification,
      writable: true,
    });
    
    // Mock PushManager
    Object.defineProperty(window, 'PushManager', {
      value: {},
      writable: true,
    });
    
    mockServiceWorker.getRegistration.mockResolvedValue(mockRegistration);
    mockPushManager.getSubscription.mockResolvedValue({ endpoint: 'test-endpoint' });

    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {
      // Wait for useEffect to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isSubscribed).toBe(true);
  });

  it('should request permission successfully', async () => {
    // Mock Notification support
    Object.defineProperty(global, 'Notification', {
      value: mockNotification,
      writable: true,
    });
    
    // Mock window.Notification
    Object.defineProperty(window, 'Notification', {
      value: mockNotification,
      writable: true,
    });
    
    // Mock PushManager
    Object.defineProperty(window, 'PushManager', {
      value: {},
      writable: true,
    });
    
    mockNotification.requestPermission.mockResolvedValue('granted');

    const { result } = renderHook(() => usePushNotifications());

    let permission: NotificationPermission;
    await act(async () => {
      permission = await result.current.requestPermission();
    });

    expect(permission!).toBe('granted');
    expect(result.current.permission).toBe('granted');
  });

  it('should subscribe successfully', async () => {
    // Mock Notification support
    Object.defineProperty(global, 'Notification', {
      value: mockNotification,
      writable: true,
    });
    
    // Mock window.Notification
    Object.defineProperty(window, 'Notification', {
      value: mockNotification,
      writable: true,
    });
    
    // Mock PushManager
    Object.defineProperty(window, 'PushManager', {
      value: {},
      writable: true,
    });
    
    const mockSubscription = {
      endpoint: 'test-endpoint',
      keys: {
        p256dh: 'test-p256dh',
        auth: 'test-auth',
      },
    };

    // Mock registerForPushNotifications
    const { registerForPushNotifications } = await import('@/features/notifications/sw/registerPush');
    (registerForPushNotifications as any).mockResolvedValue(mockSubscription);

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const { result } = renderHook(() => usePushNotifications());

    let success: boolean;
    await act(async () => {
      success = await result.current.subscribe('test-user-id');
    });

    expect(success!).toBe(true);
    expect(result.current.isSubscribed).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle subscription failure', async () => {
    // Mock Notification support
    Object.defineProperty(global, 'Notification', {
      value: mockNotification,
      writable: true,
    });
    
    // Mock window.Notification
    Object.defineProperty(window, 'Notification', {
      value: mockNotification,
      writable: true,
    });
    
    // Mock PushManager
    Object.defineProperty(window, 'PushManager', {
      value: {},
      writable: true,
    });
    
    // Mock registerForPushNotifications to fail
    const { registerForPushNotifications } = await import('@/features/notifications/sw/registerPush');
    (registerForPushNotifications as any).mockRejectedValue(new Error('Service worker error'));

    const { result } = renderHook(() => usePushNotifications());

    let success: boolean;
    await act(async () => {
      success = await result.current.subscribe('test-user-id');
    });

    expect(success!).toBe(false);
    expect(result.current.isSubscribed).toBe(false);
    expect(result.current.error).toBe('Service worker error');
  });

  it('should unsubscribe successfully', async () => {
    // Mock Notification support
    Object.defineProperty(global, 'Notification', {
      value: mockNotification,
      writable: true,
    });
    
    // Mock window.Notification
    Object.defineProperty(window, 'Notification', {
      value: mockNotification,
      writable: true,
    });
    
    // Mock PushManager
    Object.defineProperty(window, 'PushManager', {
      value: {},
      writable: true,
    });
    
    // Mock unregisterFromPushNotifications
    const { unregisterFromPushNotifications } = await import('@/features/notifications/sw/registerPush');
    (unregisterFromPushNotifications as any).mockResolvedValue(true);
    
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const { result } = renderHook(() => usePushNotifications());

    // Then unsubscribe
    let success: boolean;
    await act(async () => {
      success = await result.current.unsubscribe();
    });

    expect(success!).toBe(true);
    expect(result.current.isSubscribed).toBe(false);
  });

  it('should handle unsubscribe failure', async () => {
    // Mock Notification support
    Object.defineProperty(global, 'Notification', {
      value: mockNotification,
      writable: true,
    });
    
    // Mock window.Notification
    Object.defineProperty(window, 'Notification', {
      value: mockNotification,
      writable: true,
    });
    
    // Mock PushManager
    Object.defineProperty(window, 'PushManager', {
      value: {},
      writable: true,
    });
    
    // Mock unregisterFromPushNotifications to fail
    const { unregisterFromPushNotifications } = await import('@/features/notifications/sw/registerPush');
    (unregisterFromPushNotifications as any).mockRejectedValue(new Error('Unsubscribe error'));

    const { result } = renderHook(() => usePushNotifications());

    let success: boolean;
    await act(async () => {
      success = await result.current.unsubscribe();
    });

    expect(success!).toBe(false);
    expect(result.current.error).toBe('Unsubscribe error');
  });
});
