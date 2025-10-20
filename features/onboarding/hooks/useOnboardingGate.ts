'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook to handle onboarding gate logic
 * Redirects to welcome screen if user hasn't seen it before
 */
export function useOnboardingGate() {
  const [shouldShowWelcome, setShouldShowWelcome] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasSeenWelcome = window.localStorage.getItem('hasSeenWelcome');
    const shouldShow = hasSeenWelcome !== '1';
    
    setShouldShowWelcome(shouldShow);
    setIsLoading(false);

    // Redirect to welcome if user hasn't seen it
    if (shouldShow && window.location.pathname !== '/welcome') {
      router.push('/welcome');
    }
  }, [router]);

  const markWelcomeAsSeen = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('hasSeenWelcome', '1');
      setShouldShowWelcome(false);
    }
  };

  const resetWelcome = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('hasSeenWelcome');
      setShouldShowWelcome(true);
    }
  };

  return {
    shouldShowWelcome,
    isLoading,
    markWelcomeAsSeen,
    resetWelcome,
  };
}
