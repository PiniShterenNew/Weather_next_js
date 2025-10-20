'use client';

import { ReactNode } from 'react';
import { useAuth } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header/Header';
import BottomNavigation from '@/components/Navigation/BottomNavigation';
import { useAutoRefreshWeather } from '@/hooks/useAutoRefreshWeather';

interface PersistentLayoutProps {
  children: ReactNode;
}

/**
 * Persistent layout wrapper that keeps Header and BottomNavigation
 * visible across all page navigations (only for authenticated users)
 */
export default function PersistentLayout({ children }: PersistentLayoutProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const pathname = usePathname();
  
  // Global weather data auto-refresh - runs for all authenticated users
  useAutoRefreshWeather();
  
  // Check if current page is auth page (sign-in, sign-up)
  const isAuthPage = pathname?.includes('/sign-in') || pathname?.includes('/sign-up');
  
  // Check if current page is profile page
  const isProfilePage = pathname?.includes('/profile');
  
  // Check if current page is about page
  const isAboutPage = pathname?.includes('/settings/about');
  
  // Show layout only if user is signed in or still loading
  // Hide layout on auth pages and about page
  const showLayout = isSignedIn && !isAuthPage;
  
  // Show bottom navigation only if not on profile page or about page
  const showBottomNav = showLayout && !isProfilePage && !isAboutPage;
  
  // If not loaded yet, show content without layout (prevents flash)
  if (!isLoaded) {
    return (
      <div className="flex flex-col h-screen">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    );
  }
  
  // If on auth page or not signed in, show content without header/nav
  if (!showLayout) {
    return (
      <div className="flex flex-col h-screen">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    );
  }

  // Authenticated user - show full layout
  return (
    <div className="flex flex-col h-screen">
      {/* Header - Always render but hide on specific pages */}
      <div className={isProfilePage || isAboutPage ? 'hidden' : ''}>
        <Header />
      </div>

      {/* Main Content - Fixed height minus header and bottom nav */}
      <main className={`${isProfilePage || isAboutPage ? 'flex-1 overflow-y-auto' : 'h-[calc(100vh-5rem)] pt-16 overflow-y-auto'}`}>
        {children}
      </main>

      {/* Bottom Navigation - Always render but hide on specific pages */}
      <div className={!showBottomNav ? 'hidden' : ''}>
        <BottomNavigation />
      </div>
    </div>
  );
}

