'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth as useClerkAuth } from '@clerk/nextjs';

/**
 * Hook to handle onboarding gate logic
 * Redirects to welcome screen if user hasn't seen it before AND is not authenticated
 */
export function useOnboardingGate() {
  const [shouldShowWelcome, setShouldShowWelcome] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  // Guard Clerk in test/runtime where provider may be missing
  let isSignedIn = false;
  let authLoaded = true;
  try {
    const auth = useClerkAuth();
    isSignedIn = auth?.isSignedIn ?? false;
    authLoaded = auth?.isLoaded ?? true;
  } catch {
    // In tests without ClerkProvider, fall back to guest-mode
    isSignedIn = false;
    authLoaded = true;
  }

  // Track client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !authLoaded) return;

    const hasSeenWelcome = window.localStorage.getItem('hasSeenWelcome');
    const shouldShow = hasSeenWelcome !== '1' && !isSignedIn;
    
    setShouldShowWelcome(shouldShow);
    setIsLoading(false);

    // Redirect to welcome if user hasn't seen it and is not authenticated
    if (shouldShow && window.location.pathname !== '/welcome') {
      router.push('/welcome');
    }
    
    // If user is signed in and on welcome page, redirect to home
    if (isSignedIn && window.location.pathname === '/welcome') {
      router.push('/');
    }
  }, [router, isClient, isSignedIn, authLoaded]);

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
    shouldShowWelcome: isClient ? shouldShowWelcome : null,
    isLoading: !isClient || isLoading,
    markWelcomeAsSeen,
    resetWelcome,
  };
}
