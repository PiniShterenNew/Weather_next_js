import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import '../styles/globals.css';

import { notoSans } from '@/styles/fonts';

interface RootLayoutProps {
  children: ReactNode;
}

export const metadata: Metadata = {
  title: 'Weather App',
  description: 'Personalized weather dashboard and city management',
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={`${notoSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}


