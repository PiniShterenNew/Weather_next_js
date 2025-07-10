import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// שיפור ביצועי ההפניות על ידי הגדרת קוד סטטוס 308 (הפניה קבועה)
// זה יאפשר לדפדפנים לשמור את ההפניה במטמון ולשפר את הביצועים
export default createMiddleware(routing);

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/',
    '/(he|en)/:path*'
  ]
};