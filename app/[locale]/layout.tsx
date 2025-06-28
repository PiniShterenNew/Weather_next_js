import React from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getDirection } from '@/lib/intl';
import { ThemeAndDirectionProvider } from '@/providers/ThemeAndDirectionProvider';
import ToastHost from '@/components/Toast/ToastHost';
import LoadingOverlay from '@/components/LoadingOverlay';
import { routing } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import { Geist, Geist_Mono } from 'next/font/google';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { AppLocale } from '@/types/i18n';

type Parameters = Promise<{ locale: AppLocale }>;

// טוען את הפונטים מ-Google
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// טיפוסים ישירות בפרמטרים – בלי interface חיצוני
export default async function LocaleLayout({children, params}: {children: React.ReactNode, params: Parameters}) {
  const {locale} = await params;

  // בדיקה אם הלוקאל חוקי
  if (!locale || !routing.locales.includes(locale)) {
    notFound();
  }

  // הגדרת הלוקאל בצד השרת
  setRequestLocale(locale);

  // טעינת הודעות תרגום
  let messages;
  try {
    const localeModule = await import(`@/locales/${locale}.json`);
    messages = localeModule.default;
  } catch {
    // העברנו ל-notFound בלי הדפסת שגיאה
    notFound();
  }

  // הגדרת כיוון טקסט לפי שפה
  const direction = getDirection(locale);

  return (
    <html lang={locale} dir={direction}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeAndDirectionProvider locale={locale}>
            <LoadingOverlay />
            <ToastHost />
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </ThemeAndDirectionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

// הפקת נתיבי פרה-רנדר
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// מטא-דאטה לדפדפן
export const metadata = {
  title: 'Weather App',
};

// מאפשר ל-Next.js להחליט לבד דינאמיות
export const dynamic = 'auto';
