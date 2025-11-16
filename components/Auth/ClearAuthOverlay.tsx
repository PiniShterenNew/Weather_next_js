'use client';

import { useEffect } from 'react';

export default function ClearAuthOverlay() {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && 'sessionStorage' in window) {
        window.sessionStorage.removeItem('authOverlayUntil');
        window.sessionStorage.removeItem('authOverlayMode');
        window.sessionStorage.removeItem('authSuppressHandshake');
      }
    } catch {
      // ignore
    }
  }, []);
  return null;
}


