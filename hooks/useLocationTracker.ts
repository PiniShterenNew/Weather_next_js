'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';

export function useLocationTracker() {
  const { isSignedIn, isLoaded } = useUser();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // For now, just set up the interval structure without actual location checking
    // This prevents the infinite loop while keeping the structure ready
    if (isSignedIn && isLoaded) {
      // Set up hourly interval (disabled for now)
      // intervalRef.current = setInterval(() => {
      //   console.log('Location check would happen here');
      // }, LOCATION_CHECK_INTERVAL);
    } else {
      // Clear interval if tracking is disabled or user signs out
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isSignedIn, isLoaded]);
}