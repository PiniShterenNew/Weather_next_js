/**
 * Haptic feedback utilities for mobile devices
 * Provides tactile feedback for better user experience
 */

export type HapticFeedbackType = 'light' | 'medium' | 'heavy' | 'selection' | 'impact' | 'notification';

/**
 * Trigger haptic feedback on supported devices
 * Falls back gracefully on unsupported devices
 */
export function triggerHapticFeedback(type: HapticFeedbackType = 'light'): void {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return;

  try {
    // Modern browsers with Vibration API
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
        selection: [5],
        impact: [15],
        notification: [10, 50, 10]
      };
      
      navigator.vibrate(patterns[type] || patterns.light);
      return;
    }

    // iOS Safari with haptic feedback (iOS 10+)
    if ('ontouchstart' in window) {
      // Try to use the iOS haptic feedback API if available
      const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (iOS) {
        // This is a fallback - actual iOS haptic feedback requires native app
        // For web apps, we use a very short vibration
        if ('vibrate' in navigator) {
          navigator.vibrate(type === 'heavy' ? 25 : type === 'medium' ? 15 : 10);
        }
      }
    }
  } catch (error) {
    // Silently fail if haptic feedback is not supported
    // eslint-disable-next-line no-console
    console.debug('Haptic feedback not supported:', error);
  }
}

/**
 * Trigger haptic feedback for button press
 */
export function hapticButtonPress(): void {
  triggerHapticFeedback('light');
}

/**
 * Trigger haptic feedback for selection change
 */
export function hapticSelection(): void {
  triggerHapticFeedback('selection');
}

/**
 * Trigger haptic feedback for impact/collision
 */
export function hapticImpact(): void {
  triggerHapticFeedback('medium');
}

/**
 * Trigger haptic feedback for notification
 */
export function hapticNotification(): void {
  triggerHapticFeedback('notification');
}

/**
 * Trigger haptic feedback for swipe gesture
 */
export function hapticSwipe(): void {
  triggerHapticFeedback('light');
}
