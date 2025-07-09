import { createTranslation, getCityId, removeParentheses } from '@/lib/utils';

describe('utils', () => {
  describe('createTranslation', () => {
    it('creates Hebrew translation when lang is he', () => {
      const result = createTranslation('תל אביב', 'Tel Aviv', 'he');
      expect(result).toEqual({
        he: 'תל אביב',
        en: 'Tel Aviv'
      });
    });

    it('creates English translation when lang is en', () => {
      const result = createTranslation('New York', 'ניו יורק', 'en');
      expect(result).toEqual({
        en: 'New York',
        he: 'ניו יורק'
      });
    });

    it('handles empty strings', () => {
      const result = createTranslation('', 'fallback', 'he');
      expect(result).toEqual({
        he: '',
        en: 'fallback'
      });
    });

    it('handles special characters', () => {
      const result = createTranslation('São Paulo', 'סאו פאולו', 'en');
      expect(result).toEqual({
        en: 'São Paulo',
        he: 'סאו פאולו'
      });
    });
  });

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
  });

  describe('removeParentheses', () => {
    it('removes parentheses and content', () => {
      expect(removeParentheses('New York (NY)')).toBe('New York');
      expect(removeParentheses('Tel Aviv (Israel)')).toBe('Tel Aviv');
    });

    it('removes only first parentheses occurrence', () => {
      expect(removeParentheses('City (State) (Country)')).toBe('City');
    });

    it('handles names without parentheses', () => {
      expect(removeParentheses('London')).toBe('London');
      expect(removeParentheses('Paris')).toBe('Paris');
    });

    it('handles empty string', () => {
      expect(removeParentheses('')).toBe('');
    });

    it('handles string with only parentheses', () => {
      expect(removeParentheses('(something)')).toBe('');
    });

    it('handles parentheses at the beginning', () => {
      expect(removeParentheses('(prefix) City Name')).toBe('');
    });

    it('trims whitespace after removing parentheses', () => {
      expect(removeParentheses('City Name   (with spaces)  ')).toBe('City Name');
      expect(removeParentheses('   City Name (suffix)')).toBe('City Name');
    });

    it('handles names with closing parenthesis but no opening', () => {
      expect(removeParentheses('City Name)')).toBe('City Name)');
    });

    it('handles Hebrew text', () => {
      expect(removeParentheses('תל אביב (ישראל)')).toBe('תל אביב');
    });

    it('handles special characters', () => {
      expect(removeParentheses('São Paulo (Brazil)')).toBe('São Paulo');
      expect(removeParentheses('München (Germany)')).toBe('München');
    });
  });
});