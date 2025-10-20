import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePushNotifications } from '@/features/notifications/hooks/usePushNotifications';

// Mock fetch
global.fetch = vi.fn();

// Mock service worker
const mockServiceWorker = {
  getRegistration: vi.fn(),
  register: vi.fn(),
};

const mockPushManager = {
  getSubscription: vi.fn(),
  subscribe: vi.fn(),
};

const mockRegistration = {
  pushManager: mockPushManager,
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
    const { result } = renderHook(() => usePushNotifications());

    expect(result.current.isSupported).toBe(true);
    expect(result.current.permission).toBe('default');
    expect(result.current.isSubscribed).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle unsupported browsers', () => {
    // Mock unsupported browser
    Object.defineProperty(global, 'Notification', {
      value: undefined,
      writable: true,
    });

    const { result } = renderHook(() => usePushNotifications());

    expect(result.current.isSupported).toBe(false);
    expect(result.current.permission).toBe('denied');
  });

  it('should check subscription status on mount', async () => {
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
    const mockSubscription = {
      endpoint: 'test-endpoint',
      keys: {
        p256dh: 'test-p256dh',
        auth: 'test-auth',
      },
    };

    mockServiceWorker.getRegistration.mockResolvedValue(mockRegistration);
    mockPushManager.subscribe.mockResolvedValue(mockSubscription);
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
    mockServiceWorker.getRegistration.mockRejectedValue(new Error('Service worker error'));

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
    mockServiceWorker.getRegistration.mockResolvedValue(mockRegistration);
    mockPushManager.getSubscription.mockResolvedValue({ 
      endpoint: 'test-endpoint',
      unsubscribe: vi.fn().mockResolvedValue(true)
    });
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const { result } = renderHook(() => usePushNotifications());

    // First subscribe
    await act(async () => {
      await result.current.subscribe('test-user-id');
    });

    // Then unsubscribe
    let success: boolean;
    await act(async () => {
      success = await result.current.unsubscribe();
    });

    expect(success!).toBe(true);
    expect(result.current.isSubscribed).toBe(false);
  });

  it('should handle unsubscribe failure', async () => {
    mockServiceWorker.getRegistration.mockRejectedValue(new Error('Unsubscribe error'));

    const { result } = renderHook(() => usePushNotifications());

    let success: boolean;
    await act(async () => {
      success = await result.current.unsubscribe();
    });

    expect(success!).toBe(false);
    expect(result.current.error).toBe('Unsubscribe error');
  });
});
