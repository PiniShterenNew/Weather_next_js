// app/[locale]/layout.tsx
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { ClerkProvider } from '@clerk/nextjs';
import { heIL, enUS } from '@clerk/localizations';
import { AppLocale } from '@/types/i18n';
import { routing } from '@/i18n/routing';
import { getDirection } from '@/lib/intl';
import { ThemeAndDirectionProvider } from '@/providers/ThemeAndDirectionProvider';
import { loadBootstrapData } from '@/lib/server/bootstrap';
import { redirect } from 'next/navigation';
import { ToastHost } from '@/features/ui';
import { LoadingOverlay } from '@/features/ui';
import { notoSans } from '@/styles/fonts';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import type { ReactNode } from 'react';
import '../../styles/globals.css';
import OfflineFallback from '@/components/OfflineFallback/OfflineFallback.lazy';
import PersistentLayout from '@/components/Layout/PersistentLayout';
import NotificationHandler from '@/components/NotificationHandler';
import BootstrapHydrator from '@/providers/BootstrapHydrator';
import LocationTracker from '@/features/location/components/LocationTracker';
import LocationChangeDialog from '@/features/location/components/LocationChangeDialog';

// Updated type definition for Next.js 15 - params is now a Promise
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

  // Enforce saved user locale across the app
  const bootstrapData = await loadBootstrapData();
  if (bootstrapData && bootstrapData.user?.locale && bootstrapData.user.locale !== appLocale) {
    redirect(`/${bootstrapData.user.locale}`);
  }

  let messages;
  try {
    const localeModule = await import(`@/locales/${appLocale}.json`);
    messages = localeModule.default;
  } catch {
    notFound();
  }

  const direction = getDirection(appLocale);
  const clerkLocalization = appLocale === 'he' ? heIL : enUS;

  return (
    <ClerkProvider localization={clerkLocalization}>
      <html lang={appLocale} dir={direction}>
        <head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content={appLocale === 'he' ? "אפליקציית מזג אוויר" : "Weather App"} />
          <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
          
          {/* Preload critical resources */}
          <link rel="preload" as="image" href="/weather-icons/light/01d.svg" />
          <link rel="preload" as="image" href="/weather-icons/light/01n.svg" />
          <link rel="preload" as="image" href="/weather-icons/light/02d.svg" />
          <link rel="preload" as="image" href="/weather-icons/light/02n.svg" />
          <link rel="preload" as="image" href="/weather-icons/light/03d.svg" />
          <link rel="preload" as="image" href="/weather-icons/light/03n.svg" />
          <link rel="preload" as="image" href="/weather-icons/light/04d.svg" />
          <link rel="preload" as="image" href="/weather-icons/light/04n.svg" />
          
          {/* Preload fonts handled by Next.js font optimization */}
        </head>
        <body className={`${notoSans.variable} antialiased`}>
          <NextIntlClientProvider locale={appLocale} messages={messages}>
            <ThemeAndDirectionProvider locale={appLocale}>
              <BootstrapHydrator data={bootstrapData} />
              <NotificationHandler />
              <LocationTracker />
              <LocationChangeDialog />
              <LoadingOverlay />
              <OfflineFallback />
              <TooltipProvider>
                <PersistentLayout>{children}</PersistentLayout>
              </TooltipProvider>
              <ToastHost />
            </ThemeAndDirectionProvider>
          </NextIntlClientProvider>
        </body>
      </html>
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