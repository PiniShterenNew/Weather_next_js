// app/[locale]/layout.tsx
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { ClerkProvider } from '@clerk/nextjs';
import { heIL, enUS } from '@clerk/localizations';
import { AppLocale } from '@/types/i18n';
import { routing } from '@/i18n/routing';
import { ThemeAndDirectionProvider } from '@/providers/ThemeAndDirectionProvider';
import { loadBootstrapData } from '@/lib/server/bootstrap';
import { ToastHost } from '@/features/ui';
import { LoadingOverlay } from '@/features/ui';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import type { ReactNode } from 'react';
import '../../styles/globals.css';
import OfflineFallback from '@/components/OfflineFallback/OfflineFallback.lazy';
import PersistentLayout from '@/components/Layout/PersistentLayout';
import NotificationHandler from '@/components/NotificationHandler';
import AuthOverlayRoot from '@/components/Auth/AuthOverlayRoot';
import BootstrapHydrator from '@/providers/BootstrapHydrator';
import LocationTracker from '@/features/location/components/LocationTracker';
import LocationChangeDialog from '@/features/location/components/LocationChangeDialog';
import BusyOverlay from '@/components/ui/BusyOverlay';

// Updated type definition for Next.js 15 - params is now asynchronous
 type LayoutProps<T> = {
  children: ReactNode;
  params: Promise<T>;
};

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<{ locale: string }>) {
  // Await the params since they're now asynchronous in Next.js 15
  const { locale } = await params;

  if (!locale || !routing.locales.includes(locale as AppLocale)) {
    notFound();
  }

  // Type assertion to AppLocale since we've validated it's in routing.locales
  const appLocale = locale as AppLocale;
  setRequestLocale(appLocale);

  // Load bootstrap data but do not override the route locale.
  const bootstrapData = await loadBootstrapData();

  let messages;
  try {
    const localeModule = await import(`@/locales/${appLocale}.json`);
    messages = localeModule.default;
  } catch {
    notFound();
  }

  const clerkLocalization = appLocale === 'he' ? heIL : enUS;

  return (
    <ClerkProvider localization={clerkLocalization}>
      <NextIntlClientProvider locale={appLocale} messages={messages}>
        <ThemeAndDirectionProvider locale={appLocale}>
          <BootstrapHydrator data={bootstrapData} />
          <NotificationHandler />
          <LocationTracker />
          <LocationChangeDialog />
          <LoadingOverlay />
          <BusyOverlay />
          <OfflineFallback />
          <TooltipProvider>
            <PersistentLayout>{children}</PersistentLayout>
          </TooltipProvider>
          {/* Auth overlay controller to ensure minimum-duration auth transitions */}
          <AuthOverlayRoot />
          <ToastHost />
        </ThemeAndDirectionProvider>
      </NextIntlClientProvider>
    </ClerkProvider>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata = {
  title: 'Weather App',
  applicationName: 'Weather App | אפליקציית מזג אוויר',
  description: 'Check current weather and forecasts for cities around the world | בדוק תחזית מזג אוויר עדכנית לערים ברחבי העולם',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Weather App | אפליקציית מזג אוויר',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#171717' },
  ],
};

// Optimize page loading
export const dynamic = 'auto';
export const preferredRegion = 'auto';
export const dynamicParams = true;