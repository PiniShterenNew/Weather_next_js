// src/styles/fonts.ts
import { Noto_Sans_Hebrew } from 'next/font/google';

export const notoSans = Noto_Sans_Hebrew({
  subsets: ['latin', 'hebrew'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900' ],
  variable: '--font-sans',
  display: 'swap',
});
