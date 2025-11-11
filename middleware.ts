import { clerkMiddleware } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';

// Create i18n middleware with inline configuration for Edge Runtime compatibility
const intlMiddleware = createMiddleware({
  locales: ['en', 'he'],
  defaultLocale: 'he',
});

// Combine Clerk authentication and next-intl routing
export default clerkMiddleware(async (auth, request) => {
  const pathname = new URL(request.url).pathname;

  // API routes should NEVER go through intl middleware
  if (pathname.startsWith('/api/')) {
    const publicApiRoutes = ['/api/weather', '/api/suggest', '/api/reverse', '/api/location/check'];
    const isPublicApi = publicApiRoutes.some(route => pathname.startsWith(route));
    
    if (isPublicApi) {
      return; // No middleware processing for public API
    }
    
    // Protected API routes
    await auth.protect();
    return; // No intl middleware
  }

  // Check if route is public (auth pages)
  const isPublic =
    pathname.match(/^\/(sign-in|sign-up|forgot-password|sso-callback)/) ||
    pathname.match(/^\/(he|en)\/(sign-in|sign-up|forgot-password|sso-callback)/) ||
    pathname.includes('/sign-in/magic-link');

  // Allow public routes without authentication
  if (isPublic) {
    return intlMiddleware(request);
  }

  // Protect all other routes with Clerk authentication
  // Extract locale from pathname and create absolute URL for redirect
  const locale = pathname.startsWith('/he') ? 'he' : 'en';
  const origin = new URL(request.url).origin;
  const redirectUrl = `${origin}/${locale}/sign-in`;

  await auth.protect({
    unauthenticatedUrl: redirectUrl
  });

  // Apply i18n routing
  return intlMiddleware(request);
});

export const config = {
  matcher: [
    '/((?!_next|.*\\..*).*)', // Include API routes but handle them separately
  ],
};