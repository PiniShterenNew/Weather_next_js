import { RateLimiterMemory } from 'rate-limiter-flexible';

// Centralized rate limiter configuration for all API routes
const limiters = {
  '/api/weather': new RateLimiterMemory({ points: 50, duration: 60 }),
  '/api/suggest': new RateLimiterMemory({ points: 150, duration: 60 }),
  '/api/user/preferences': new RateLimiterMemory({ points: 100, duration: 60 }),
  '/api/user/sync': new RateLimiterMemory({ points: 50, duration: 60 }),
  '/api/reverse': new RateLimiterMemory({ points: 100, duration: 60 }),
};

/**
 * Find the appropriate rate limiter for a given API path
 * @param path The API path to get limiter for
 * @returns The rate limiter instance
 */
export function findMatchingLimiter(path: string): RateLimiterMemory {
  return limiters[path as keyof typeof limiters] || 
         new RateLimiterMemory({ points: 60, duration: 60 });
}

/**
 * Extract client IP from request headers
 * @param req The incoming request
 * @returns Client IP address
 */
export function getRequestIP(req: Request): string {
  return req.headers.get('x-forwarded-for') || 
         req.headers.get('x-real-ip') || 
         'unknown';
}

/**
 * Get localized error message for rate limit exceeded
 * @param locale User locale ('en' or 'he')
 * @returns Localized error message
 */
export function getErrorMessage(locale: 'en' | 'he'): string {
  return locale === 'he'
    ? 'חרגת ממגבלת הבקשות. נסה שוב בעוד דקה.'
    : 'Too many requests. Please try again later.';
}
