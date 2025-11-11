'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useWeatherStore } from '@/store/useWeatherStore';
import { fetchSecure } from '@/lib/fetchSecure';
import { logger } from '@/lib/errors';

export function useUserSync() {
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);
  const { setIsAuthenticated, showToast } = useWeatherStore((state) => ({
    setIsAuthenticated: state.setIsAuthenticated,
    showToast: state.showToast,
  }));
  const [hasBootstrapFailed, setHasBootstrapFailed] = useState(false);
  const hasAttemptedRef = useRef(false);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTestEnvironment = process.env.NODE_ENV === 'test';
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 1500;

  useEffect(
    () => () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (isTestEnvironment) {
      return;
    }

    const checkUserSync = async () => {
      if (!isLoaded) return;
      
      if (!isSignedIn) {
        // User not signed in, redirect to sign in
        const currentPath = window.location.pathname;
        const locale = currentPath.startsWith('/en') ? 'en' : 'he';
        router.push(`/${locale}/sign-in`);
        return;
      }

      if (isSignedIn && user) {
        if (hasAttemptedRef.current && hasBootstrapFailed) {
          return;
        }

        setIsChecking(true);
        hasAttemptedRef.current = true;
        
        try {
          // Try to sync user with database by calling bootstrap
          const response = await fetchSecure('/api/bootstrap', { requireAuth: true });
          
          if (response.ok) {
            // User exists in database, set as authenticated
            setIsAuthenticated(true);
            setHasBootstrapFailed(false);
            retryCountRef.current = 0;
          } else if (response.status === 404) {
            // User not found in database, redirect to sign in
            const currentPath = window.location.pathname;
            const locale = currentPath.startsWith('/en') ? 'en' : 'he';
            router.push(`/${locale}/sign-in`);
            retryCountRef.current = 0;
          } else {
            setHasBootstrapFailed(true);
            retryCountRef.current = 0;
            logger.error('Bootstrap request failed', undefined, { status: response.status });
          }
        } catch (error) {
          setHasBootstrapFailed(true);
          logger.error('Bootstrap request errored', error instanceof Error ? error : undefined);

          const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
          const isTokenError = errorMessage.includes('authorization token is required');
          const isNetworkError = errorMessage.includes('network') || errorMessage.includes('fetch');

          const scheduleRetry = () => {
            retryCountRef.current += 1;
            retryTimeoutRef.current = setTimeout(() => {
              setHasBootstrapFailed(false);
              hasAttemptedRef.current = false;
            }, RETRY_DELAY_MS);
          };

          if (isTokenError || isNetworkError) {
            if (retryCountRef.current < MAX_RETRIES) {
              scheduleRetry();
            } else {
              retryCountRef.current = 0;

              if (isTokenError) {
                const currentPath = window.location.pathname;
                const locale = currentPath.startsWith('/en') ? 'en' : 'he';
                router.push(`/${locale}/sign-in`);
              } else if (isNetworkError) {
                showToast({
                  type: 'error',
                  message: 'errors.networkError',
                });
              }
            }
          }
        } finally {
          setIsChecking(false);
        }
      }
    };

    checkUserSync();
  }, [isLoaded, isSignedIn, user, router, setIsAuthenticated, hasBootstrapFailed, isTestEnvironment, showToast]);

  if (isTestEnvironment) {
    return { isChecking: false, hasBootstrapFailed: false };
  }

  return { isChecking, hasBootstrapFailed };
}
