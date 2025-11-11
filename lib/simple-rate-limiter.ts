// Simple in-memory rate limiter to replace rate-limiter-flexible
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export class SimpleRateLimiter {
  private points: number;
  private duration: number; // in seconds

  constructor(options: { points: number; duration: number }) {
    this.points = options.points;
    this.duration = options.duration;
  }

  async consume(key: string): Promise<void> {
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + this.duration * 1000,
      });
      return;
    }

    if (entry.count >= this.points) {
      // Rate limit exceeded
      const error = new Error('Rate limit exceeded');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error as any).msBeforeNext = entry.resetTime - now;
      throw error;
    }

    // Increment counter
    entry.count++;
    rateLimitStore.set(key, entry);
  }
}

// Centralized rate limiter configuration for all API routes
const limiters = {
  '/api/weather': new SimpleRateLimiter({ points: 50, duration: 60 }),
  '/api/suggest': new SimpleRateLimiter({ points: 150, duration: 60 }),
  '/api/user/preferences': new SimpleRateLimiter({ points: 100, duration: 60 }),
  '/api/user/sync': new SimpleRateLimiter({ points: 50, duration: 60 }),
  '/api/reverse': new SimpleRateLimiter({ points: 100, duration: 60 }),
  '/api/bootstrap': new SimpleRateLimiter({ points: 20, duration: 60 }), // Lower limit for bootstrap
};

/**
 * Find the appropriate rate limiter for a given API path
 * @param path The API path to get limiter for
 * @returns The rate limiter instance
 */
export function findMatchingLimiter(path: string): SimpleRateLimiter {
  return limiters[path as keyof typeof limiters] || 
         new SimpleRateLimiter({ points: 60, duration: 60 });
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
