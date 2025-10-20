// src/styles/fonts.ts
import { Noto_Sans_Hebrew } from 'next/font/google';

/**
 * Noto Sans Hebrew font configuration
 * Optimized for performance - only loading weights actually used in the app
 * Removed: 100, 200, 800, 900 (saves ~200-300KB)
 */
export const notoSans = Noto_Sans_Hebrew({
  subsets: ['latin', 'hebrew'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Arial', 'sans-serif'],
});
