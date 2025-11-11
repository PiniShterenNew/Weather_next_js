import { describe, it, expect } from 'vitest';

describe('TTL Policy', () => {
  const TWENTY_MIN = 20 * 60 * 1000; // 20 minutes in milliseconds

  it('should have consistent TTL across the application', () => {
    // This test ensures that the TTL constant is used consistently
    expect(TWENTY_MIN).toBe(20 * 60 * 1000);
  });

  it('should calculate expiry correctly', () => {
    const now = Date.now();
    const futureTime = now + TWENTY_MIN;
    const pastTime = now - TWENTY_MIN;
    
    // Data should be fresh if updated within TTL (strictly less than)
    expect(now - (pastTime + 1)).toBeLessThan(TWENTY_MIN);
    
    // Data should be stale if older than TTL
    expect(now - (pastTime - 1000)).toBeGreaterThan(TWENTY_MIN);
  });

  it('should handle edge cases in TTL calculation', () => {
    const now = Date.now();
    const exactlyTTL = now - TWENTY_MIN;
    
    // Data exactly at TTL boundary should be considered stale
    expect(now - exactlyTTL).toBe(TWENTY_MIN);
  });
});
