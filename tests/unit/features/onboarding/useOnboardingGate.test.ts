import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOnboardingGate } from '@/features/onboarding/hooks/useOnboardingGate';

// Mock Next.js router
const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useOnboardingGate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/',
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should show welcome screen if user has not seen it', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useOnboardingGate());

    expect(result.current.shouldShowWelcome).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('should not show welcome screen if user has seen it', () => {
    localStorageMock.getItem.mockReturnValue('1');

    const { result } = renderHook(() => useOnboardingGate());

    expect(result.current.shouldShowWelcome).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('should redirect to welcome page if user has not seen it', () => {
    localStorageMock.getItem.mockReturnValue(null);

    renderHook(() => useOnboardingGate());

    expect(mockPush).toHaveBeenCalledWith('/welcome');
  });

  it('should not redirect if already on welcome page', () => {
    localStorageMock.getItem.mockReturnValue(null);
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/welcome',
      },
      writable: true,
    });

    renderHook(() => useOnboardingGate());

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should mark welcome as seen', async () => {
    // Mock localStorage to return '1' after setItem is called
    localStorageMock.getItem.mockReturnValue('1');
    
    const { result } = renderHook(() => useOnboardingGate());

    act(() => {
      result.current.markWelcomeAsSeen();
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('hasSeenWelcome', '1');
    
    // Wait for state update
    await waitFor(() => {
      expect(result.current.shouldShowWelcome).toBe(false);
    });
  });

  it('should reset welcome', () => {
    const { result } = renderHook(() => useOnboardingGate());

    act(() => {
      result.current.resetWelcome();
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('hasSeenWelcome');
    expect(result.current.shouldShowWelcome).toBe(true);
  });
});
