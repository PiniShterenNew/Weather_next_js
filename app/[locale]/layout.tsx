// app/[locale]/layout.tsx
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { AppLocale } from '@/types/i18n';
import { routing } from '@/i18n/routing';
import { getDirection } from '@/lib/intl';
import { ThemeAndDirectionProvider } from '@/providers/ThemeAndDirectionProvider';
import ToastHost from '@/components/Toast/ToastHost';
import LoadingOverlay from '@/components/LoadingOverlay';
import { notoSans } from '@/styles/fonts';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import type { ReactNode } from 'react';
import '../../styles/globals.css';

// Updated type definition for Next.js 15 - params is now a Promise
type LayoutProps<T> = {
  children: ReactNode;
  params: Promise<T>;
};

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<{ locale: AppLocale }>) {
  // Await the params since they're now asynchronous in Next.js 15
  const { locale } = await params;

  if (!locale || !routing.locales.includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  let messages;
  try {
    const localeModule = await import(`@/locales/${locale}.json`);
    messages = localeModule.default;
  } catch {
    notFound();
  }

  const direction = getDirection(locale);

  return (
    <html lang={locale} dir={direction}>
      <body className={`${notoSans.variable} antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeAndDirectionProvider locale={locale}>
            <LoadingOverlay />
            <ToastHost />
            <TooltipProvider>{children}</TooltipProvider>
          </ThemeAndDirectionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata = {
  title: 'Weather App',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#171717' },
  ],
};

// Optimize page loading
export const dynamic = 'auto';
export const preferredRegion = 'auto';
export const dynamicParams = true;