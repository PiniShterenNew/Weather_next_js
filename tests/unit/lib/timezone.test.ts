import { describe, it, expect, vi } from 'vitest';
import { formatTimeWithOffset, formatTimeWithTimezone, isSameTimezone } from '@/lib/helpers/timezone';

describe('timezone helpers', () => {
  it('formatTimeWithOffset returns --:-- for invalid input', () => {
    expect(formatTimeWithOffset(NaN as any, 0)).toBe('--:--');
    expect(formatTimeWithOffset(1700000000, NaN as any)).toBe('--:--');
  });

  it('formatTimeWithOffset formats time with offset seconds', () => {
    // 00:00 UTC with +3600s offset should be 01:00
    const midnightUtc = Date.UTC(2023, 0, 1, 0, 0, 0) / 1000;
    expect(formatTimeWithOffset(midnightUtc, 3600)).toBe('01:00');
  });

  it('formatTimeWithOffset shows both times when userOffset provided', () => {
    const midnightUtc = Date.UTC(2023, 0, 1, 0, 0, 0) / 1000;
    const result = formatTimeWithOffset(midnightUtc, 0, 3600);
    expect(result).toMatch(/00:00/);
    expect(result).toMatch(/\(01:00\)/);
  });

  it('formatTimeWithTimezone returns --:-- for invalid', () => {
    expect(formatTimeWithTimezone(NaN as any, 'Asia/Jerusalem')).toBe('--:--');
    expect(formatTimeWithTimezone(1700000000, '')).toBe('--:--');
  });

  it('isSameTimezone compares numeric offsets approximately', () => {
    expect(isSameTimezone(7200, 7260)).toBe(true);
    expect(isSameTimezone(7200, 8000)).toBe(false);
  });

  it('isSameTimezone returns false for missing values', () => {
    expect(isSameTimezone(undefined as any, 0)).toBe(false);
    expect(isSameTimezone('Asia/Jerusalem', undefined as any)).toBe(false);
  });
});


