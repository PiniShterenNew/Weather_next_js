'use client';

import { useEffect, useState } from 'react';
import AuthTransitionScreen from './AuthTransitionScreen';

type Mode = 'signing-in' | 'signing-out';

export default function AuthOverlayController() {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<Mode>('signing-in');

  useEffect(() => {
    const readFromStorage = () => {
      try {
        if (typeof window === 'undefined' || !('sessionStorage' in window)) {
          setVisible(false);
          return;
        }
        const untilStr = window.sessionStorage.getItem('authOverlayUntil');
        const modeStr = (window.sessionStorage.getItem('authOverlayMode') as Mode) || 'signing-in';
        const until = untilStr ? parseInt(untilStr, 10) : 0;
        const now = Date.now();
        const shouldShow = until > now;
        setVisible(shouldShow);
        setMode(modeStr);
        if (!shouldShow) {
          window.sessionStorage.removeItem('authOverlayUntil');
          window.sessionStorage.removeItem('authOverlayMode');
        }
      } catch {
        setVisible(false);
      }
    };

    readFromStorage();
    const id = setInterval(readFromStorage, 100);
    return () => clearInterval(id);
  }, []);

  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <AuthTransitionScreen mode={mode} />
    </div>
  );
}


