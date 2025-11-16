'use client';

import AuthTransitionScreen from '@/components/Auth/AuthTransitionScreen';
import { useEffect } from 'react';

export default function Loading() {
  useEffect(() => {
    try {
      const minDuration = 900; // ms
      const until = Date.now() + minDuration;
      if (typeof window !== 'undefined' && 'sessionStorage' in window) {
        window.sessionStorage.setItem('authOverlayUntil', String(until));
        window.sessionStorage.setItem('authOverlayMode', 'signing-in');
      }
    } catch {
      // ignore storage errors
    }
  }, []);
  return <AuthTransitionScreen mode="signing-in" />;
}


