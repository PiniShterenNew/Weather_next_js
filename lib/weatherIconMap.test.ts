import { weatherIconMap } from '@/lib/weatherIconMap';

describe('weatherIconMap', () => {
  it('maps icon code to descriptive string', () => {
    expect(weatherIconMap['01d']).toBeDefined();
    expect(typeof weatherIconMap['01d']).toBe('string');
  });

  it('returns undefined for unknown code', () => {
    expect(weatherIconMap['unknown' as any]).toBeUndefined();
  });

  it('contains expected entries', () => {
    expect(weatherIconMap['10n']).toContain('/weather-icons/10n.svg');
    expect(weatherIconMap['13d']).toContain('/weather-icons/13d.svg');
  });
});
