import { describe, it, expect } from 'vitest';
import { getCityId } from '@/lib/utils';

describe('getCityId', () => {
  it('creates city ID from coordinates', () => {
    expect(getCityId(40.7128, -74.0060)).toBe('city:40.7_-74.0');
    expect(getCityId(31.7683, 35.2137)).toBe('city:31.8_35.2');
  });

  it('rounds coordinates to 1 decimal place', () => {
    expect(getCityId(40.71284567, -74.00603123)).toBe('city:40.7_-74.0');
    expect(getCityId(40.74999, -74.04999)).toBe('city:40.7_-74.0');
    expect(getCityId(40.75001, -74.05001)).toBe('city:40.8_-74.1');
  });

  it('handles zero coordinates', () => {
    expect(getCityId(0, 0)).toBe('city:0.0_0.0');
  });

  it('handles negative coordinates', () => {
    expect(getCityId(-33.8688, 151.2093)).toBe('city:-33.9_151.2');
  });

  it('handles edge cases with very small numbers', () => {
    expect(getCityId(0.00001, -0.00001)).toBe('city:0.0_-0.0');
    expect(getCityId(0.05, -0.05)).toBe('city:0.1_-0.1');
  });

  it('creates unique IDs for nearby coordinates', () => {
    const id1 = getCityId(40.7, -74.0);
    const id2 = getCityId(40.8, -74.0);
    const id3 = getCityId(40.7, -74.1);
    
    expect(id1).not.toBe(id2);
    expect(id1).not.toBe(id3);
    expect(id2).not.toBe(id3);
  });

  it('maintains consistency across multiple calls', () => {
    const coords = [40.7128, -74.0060];
    const id1 = getCityId(coords[0], coords[1]);
    const id2 = getCityId(coords[0], coords[1]);
    
    expect(id1).toBe(id2);
  });
});
