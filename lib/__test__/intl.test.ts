import { getDirection } from '@/lib/intl';

describe('intl', () => {
  it('returns rtl for he', () => {
    expect(getDirection('he')).toBe('rtl');
  });

  it('returns ltr for en', () => {
    expect(getDirection('en')).toBe('ltr');
  });

  it('returns ltr by default for unknown locale', () => {
    expect(getDirection('unknown' as any)).toBe('ltr');
  });
});
