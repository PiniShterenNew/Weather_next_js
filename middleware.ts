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

  // Skip i18n middleware for API routes
  if (pathname.startsWith('/api/')) {
    // Only run Clerk authentication for API routes
    await auth.protect();
    return;
  }

  // Check if route is public (auth pages)
  const isPublic =
    pathname.match(/^\/(sign-in|sign-up|forgot-password|sso-callback)/) ||
    pathname.match(/^\/(he|en)\/(sign-in|sign-up|forgot-password|sso-callback)/);

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
    '/((?!_next|.*\\..*|favicon.ico).*)',
    '/api/(.*)',
  ],
};