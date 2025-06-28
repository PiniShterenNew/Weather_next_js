import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // ✅ מטצ'ר משופר לטיפול נכון בכל הנתיבים
  matcher: [
    // כלול את כל הנתיבים חוץ מ-API, _next, ו-static files
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // וודא שגם root נכלל במפורש
    '/',
    // כלול נתיבי locale באופן מפורש
    '/(he|en)/:path*'
  ]
};