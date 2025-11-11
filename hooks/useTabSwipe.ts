'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { hapticSwipe } from '@/lib/haptics';

const SWIPE_THRESHOLD = 80; // pixels
const SWIPE_VELOCITY_THRESHOLD = 400; // pixels per second

interface TabRoute {
  path: string;
  index: number;
}

const TAB_ROUTES: TabRoute[] = [
  { path: '/', index: 0 },
  { path: '/cities', index: 1 },
  { path: '/add-city', index: 2 },
  { path: '/settings', index: 3 },
];

export function useTabSwipe() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const isRTL = locale === 'he';
  
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [startX, setStartX] = useState<number | null>(null);
  const [startY, setStartY] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);

  // Find current tab index
  const getCurrentTabIndex = useCallback(() => {
    const currentRoute = TAB_ROUTES.find(route => {
      if (route.path === '/') {
        return pathname === '/';
      }
      return pathname.startsWith(route.path);
    });
    return currentRoute?.index ?? 0;
  }, [pathname]);

  // Navigate to next/previous tab
  const navigateToTab = useCallback((direction: 'next' | 'prev') => {
    const currentIndex = getCurrentTabIndex();
    let newIndex: number;

    if (direction === 'next') {
      newIndex = (currentIndex + 1) % TAB_ROUTES.length;
    } else {
      newIndex = (currentIndex - 1 + TAB_ROUTES.length) % TAB_ROUTES.length;
    }

    const newRoute = TAB_ROUTES[newIndex];
    if (newRoute && newRoute.path !== pathname) {
      hapticSwipe();
      router.push(newRoute.path);
      setSwipeProgress(0);
    }
  }, [getCurrentTabIndex, pathname, router]);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Only allow swipe from main content area, not from interactive elements
    const target = e.target as HTMLElement;
    
    // Don't allow swipe from buttons, inputs, scrollable areas, etc.
    if (
      target.closest('button') ||
      target.closest('[role="button"]') ||
      target.closest('input') ||
      target.closest('select') ||
      target.closest('textarea') ||
      target.closest('[data-drag-handle]') ||
      target.closest('[data-testid="weather-list"]') || // Prevent conflict with city swipe
      target.closest('[data-testid="hourly-forecast"]') || // Prevent conflict with hourly scroll
      target.closest('[data-testid="forecast-list"]') || // Prevent conflict with forecast scroll
      target.closest('.overflow-x-auto') || // Prevent conflict with horizontal scroll
      target.closest('a[href]') // Don't interfere with links
    ) {
      return;
    }

    // Allow swipe on main content area
    // But exclude specific interactive areas
    const mainElement = target.closest('main');
    if (mainElement) {
      // Check if we're in a scrollable container that should be excluded
      const scrollableContainer = target.closest('.overflow-x-auto, [style*="overflow-x"]');
      if (!scrollableContainer) {
        // Allow swipe on main element or its scrollable children
        setStartX(e.touches[0].clientX);
        setStartY(e.touches[0].clientY);
        setStartTime(Date.now());
        setIsSwiping(true);
        setSwipeProgress(0);
      }
    }
  }, []);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!startX || !startY || !isSwiping) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - startX;
    const deltaY = Math.abs(currentY - startY);
    
    // Only allow horizontal swipes, prevent if too vertical
    // Check if the movement is primarily horizontal
    if (deltaY > Math.abs(deltaX) * 0.7 && Math.abs(deltaX) < 30) {
      // Too vertical, cancel swipe
      setIsSwiping(false);
      setSwipeProgress(0);
      return;
    }

    // Calculate progress for visual feedback (0 to 1)
    const maxDelta = 150; // Max swipe distance for progress calculation
    const progress = Math.min(Math.abs(deltaX) / maxDelta, 1);
    setSwipeProgress(progress);

    // Prevent default scrolling during horizontal swipe (only if horizontal movement is significant)
    if (Math.abs(deltaX) > 15 && Math.abs(deltaX) > deltaY * 1.5) {
      e.preventDefault();
    }
  }, [startX, startY, isSwiping]);

  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!startX || !startTime || !isSwiping) {
      setIsSwiping(false);
      setSwipeProgress(0);
      return;
    }

    const endX = e.changedTouches[0].clientX;
    const endTime = Date.now();
    const deltaX = endX - startX;
    const deltaTime = endTime - startTime;
    const velocity = Math.abs(deltaX) / (deltaTime / 1000);

    // Determine if swipe threshold was exceeded
    const swipeDistance = Math.abs(deltaX);
    const swipeVelocity = Math.abs(velocity);

    if (
      swipeDistance > SWIPE_THRESHOLD ||
      swipeVelocity > SWIPE_VELOCITY_THRESHOLD
    ) {
      // Determine direction based on RTL
      let shouldGoNext: boolean;
      
      if (isRTL) {
        // RTL: swipe left = next, swipe right = prev
        shouldGoNext = deltaX < 0;
      } else {
        // LTR: swipe right = next, swipe left = prev
        shouldGoNext = deltaX > 0;
      }

      if (shouldGoNext) {
        navigateToTab('next');
      } else {
        navigateToTab('prev');
      }
    }

    // Reset
    setStartX(null);
    setStartY(null);
    setStartTime(null);
    setIsSwiping(false);
    setSwipeProgress(0);
  }, [startX, startTime, isSwiping, isRTL, navigateToTab]);

  // Setup touch event listeners
  useEffect(() => {
    // Only add listeners on mobile/tablet
    if (typeof window === 'undefined') return;

    const mainElement = document.querySelector('main');
    if (!mainElement) return;

    mainElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    mainElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    mainElement.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      mainElement.removeEventListener('touchstart', handleTouchStart);
      mainElement.removeEventListener('touchmove', handleTouchMove);
      mainElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    swipeProgress,
    isSwiping,
  };
}

